import { NextResponse } from "next/server";
import { handleStripeEvent } from "@maicro/core/billing";
import { ready } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook: verify the signature, then let core/billing decide what
 * the event means (packages/core/src/billing, tested there). Answers 200 for
 * events it does not act on, so Stripe stops retrying them.
 */
export async function POST(req: Request) {
  const stripe = await getStripe();
  if (!stripe || !env.stripeWebhookSecret) return NextResponse.json({ ok: false, reason: "stripe not configured" }, { status: 503 });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: false }, { status: 400 });
  const payload = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ ok: false, error: "bad signature" }, { status: 400 });
  }
  await ready();
  const outcome = await handleStripeEvent(event as unknown as Parameters<typeof handleStripeEvent>[0]);
  return NextResponse.json({ received: true, outcome });
}
