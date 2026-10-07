import { NextResponse } from "next/server";
import { ready } from "@/lib/db";
import { transitionStatus } from "@/lib/core";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { PRICES } from "@maicro/core/copy";

export const runtime = "nodejs";

/**
 * POST business, scan, plan=setup|monitor → Stripe Checkout.
 * setup: mode=payment (one-off €149). monitor: mode=subscription (€49/mo) with the setup price as a one-time line item.
 * Mock mode (no STRIPE_SECRET_KEY): marks the business as trial directly and redirects to /welkom?mock=1.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const businessId = String(form.get("business") ?? "");
  const scanRunId = String(form.get("scan") ?? "");
  const plan = form.get("plan") === "setup" ? "setup" : "monitor";
  const db = await ready();
  const business = await db.getBusiness(businessId);
  const back = `${env.baseUrl}/r/${encodeURIComponent(scanRunId)}`;
  if (!business) return NextResponse.redirect(`${env.baseUrl}/`, 303);

  const stripe = await getStripe();
  if (!stripe) {
    await db.upsertBusiness({ id: business.id, slug: business.slug, name: business.name, place: business.place, plan });
    await transitionStatus(business.id, "trial", { via: "checkout.mock", plan });
    await db.enqueueJob("setup", { businessId: business.id });
    await db.logEvent(business.id, "checkout.mock", { plan });
    return NextResponse.redirect(`${env.baseUrl}/welkom?mock=1&business=${business.id}`, 303);
  }

  const setupLine = env.stripePriceSetup
    ? { price: env.stripePriceSetup, quantity: 1 }
    : { price_data: { currency: "eur", unit_amount: PRICES.setupEur * 100, product_data: { name: "Maicro Instellen (eenmalig)" } }, quantity: 1 };
  const monitorLine = env.stripePriceMonitor
    ? { price: env.stripePriceMonitor, quantity: 1 }
    : { price_data: { currency: "eur", unit_amount: PRICES.monitorEurPerMonth * 100, recurring: { interval: "month" as const }, product_data: { name: "Maicro Bewaking (per maand)" } }, quantity: 1 };

  const session = await stripe.checkout.sessions.create({
    mode: plan === "setup" ? "payment" : "subscription",
    line_items: plan === "setup" ? [setupLine] : [monitorLine, setupLine],
    payment_method_types: plan === "setup" ? ["ideal", "card"] : ["ideal", "card", "sepa_debit"],
    locale: "nl",
    tax_id_collection: { enabled: true },
    customer_email: business.ownerEmail ?? undefined,
    customer_creation: plan === "setup" ? "always" : undefined,
    billing_address_collection: "required",
    allow_promotion_codes: false,
    metadata: { businessId: business.id, plan, scanRunId },
    subscription_data: plan === "monitor" ? { metadata: { businessId: business.id } } : undefined,
    success_url: `${env.baseUrl}/welkom?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: back,
  });
  await db.logEvent(business.id, "checkout.started", { plan, sessionId: session.id });
  return NextResponse.redirect(session.url ?? back, 303);
}
