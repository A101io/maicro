import { NextResponse } from "next/server";
import { ready } from "@/lib/db";
import { transitionStatus } from "@/lib/core";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/** Stripe webhook: on checkout.session.completed → plan + status=trial, stripe ids, enqueue setup. */
export async function POST(req: Request) {
  const stripe = await getStripe();
  if (!stripe || !env.stripeWebhookSecret) return NextResponse.json({ ok: false, reason: "stripe not configured" }, { status: 503 });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: false }, { status: 400 });
  const payload = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, env.stripeWebhookSecret);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "bad signature" }, { status: 400 });
  }

  const db = await ready();
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const businessId = session.metadata?.businessId;
    const plan = session.metadata?.plan === "setup" ? "setup" : "monitor";
    if (businessId) {
      const business = await db.getBusiness(businessId);
      if (business) {
        await db.upsertBusiness({
          id: business.id,
          slug: business.slug,
          name: business.name,
          place: business.place,
          plan,
          ownerEmail: business.ownerEmail ?? session.customer_details?.email ?? null,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
        });
        await transitionStatus(business.id, "trial", { via: "stripe", plan, sessionId: session.id });
        await db.enqueueJob("setup", { businessId: business.id });
        await db.logEvent(business.id, "checkout.completed", { plan, sessionId: session.id });
      }
    }
  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const businessId = sub.metadata?.businessId;
    if (businessId) {
      const business = await db.getBusiness(businessId);
      if (business) {
        await transitionStatus(business.id, "churned", { via: "stripe", reason: "subscription.deleted", subscriptionId: sub.id });
      }
    }
  } else if (event.type === "invoice.payment_failed") {
    const inv = event.data.object;
    const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
    await db.logEvent(null, "invoice.payment_failed", { customerId: customerId ?? null, invoiceId: inv.id });
    // Dunning: 14 days after the first failed payment the worker cron pauses the business (reads this event).
  }
  return NextResponse.json({ received: true });
}
