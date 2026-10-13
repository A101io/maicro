import { NextResponse } from "next/server";
import { ready } from "@/lib/db";
import { transitionStatus } from "@/lib/core";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { getSession, getOwnedBusiness } from "@/lib/session";
import { isVerifiedOwner } from "@maicro/core/shared";
import { copyFor, PRICES } from "@maicro/core/copy";
import { localizeHref } from "@/lib/lang-paths";
import { langFromReferer } from "@/lib/request-lang";

export const runtime = "nodejs";

/**
 * POST business, scan, plan → Stripe Checkout.
 *   setup          one-off €149 (mode=payment, with an invoice)
 *   monitor        €49/month with the €149 setup as a one-time first line
 *   monitor_addon  €49/month only, for a verified owner who already paid setup
 * Prices are excl. btw: every line carries the 21% NL tax rate, and a live
 * checkout without one refuses rather than undercharge by 21%.
 * Mock mode (no STRIPE_SECRET_KEY): marks the business paid and goes to /welkom.
 */
export async function POST(req: Request) {
  const lang = langFromReferer(req);
  const copy = copyFor(lang);
  // Pages we send people to, in the language they posted from.
  const page = (path: string) => `${env.baseUrl}${localizeHref(path, lang)}`;
  const form = await req.formData();
  const businessId = String(form.get("business") ?? "");
  const scanRunId = String(form.get("scan") ?? "");
  const raw = String(form.get("plan") ?? "");
  const plan = raw === "setup" ? "setup" : raw === "monitor_addon" ? "monitor_addon" : "monitor";
  const db = await ready();
  const business = await db.getBusiness(businessId);
  const back = plan === "monitor_addon" ? page(`/app/abonnement`) : page(`/r/${encodeURIComponent(scanRunId)}`);
  if (!business) return NextResponse.redirect(page(`/`), 303);

  if (plan === "monitor_addon") {
    // Adding monitoring changes an existing customer's bill: owner only.
    const session = await getSession();
    if (!session || !isVerifiedOwner(business, session.userId)) return NextResponse.redirect(page(`/app/google?eerst=1`), 303);
  }

  const stripe = await getStripe();
  if (!stripe) {
    const storedPlan = plan === "setup" ? "setup" : "monitor";
    await db.upsertBusiness({ id: business.id, slug: business.slug, name: business.name, place: business.place, plan: storedPlan });
    if (plan !== "monitor_addon") {
      await transitionStatus(business.id, "trial", { via: "checkout.mock", plan });
      await db.enqueueJob("setup", { businessId: business.id });
    }
    await db.logEvent(business.id, "checkout.mock", { plan });
    return NextResponse.redirect(plan === "monitor_addon" ? page(`/app/abonnement?toegevoegd=1`) : page(`/welkom?mock=1&business=${business.id}`), 303);
  }

  const taxRate = env.stripeTaxRateId;
  if (!taxRate) {
    console.error("checkout refused: STRIPE_TAX_RATE_ID is not set; prices are excl. btw");
    await db.logEvent(business.id, "checkout.refused", { reason: "no_tax_rate", plan });
    return NextResponse.redirect(`${back}?betaling=fout`, 303);
  }
  const tax_rates = [taxRate];
  const setupLine = env.stripePriceSetup
    ? { price: env.stripePriceSetup, quantity: 1, tax_rates }
    : { price_data: { currency: "eur", unit_amount: PRICES.setupEur * 100, product_data: { name: copy.checkout.productSetup } }, quantity: 1, tax_rates };
  const monitorLine = env.stripePriceMonitor
    ? { price: env.stripePriceMonitor, quantity: 1, tax_rates }
    : { price_data: { currency: "eur", unit_amount: PRICES.monitorEurPerMonth * 100, recurring: { interval: "month" as const }, product_data: { name: copy.checkout.productMonitor } }, quantity: 1, tax_rates };

  const payment = plan === "setup";
  const session = await stripe.checkout.sessions.create({
    mode: payment ? "payment" : "subscription",
    line_items: plan === "setup" ? [setupLine] : plan === "monitor" ? [monitorLine, setupLine] : [monitorLine],
    payment_method_types: payment ? ["ideal", "card"] : ["ideal", "card", "sepa_debit"],
    locale: lang,
    tax_id_collection: { enabled: true },
    billing_address_collection: "required",
    allow_promotion_codes: false,
    ...(business.stripeCustomerId ? { customer: business.stripeCustomerId, customer_update: { name: "auto" as const, address: "auto" as const } } : { customer_email: business.ownerEmail ?? undefined }),
    ...(payment ? { customer_creation: business.stripeCustomerId ? undefined : ("always" as const), invoice_creation: { enabled: true } } : {}),
    metadata: { businessId: business.id, plan, scanRunId },
    subscription_data: payment ? undefined : { metadata: { businessId: business.id } },
    success_url: plan === "monitor_addon" ? page(`/app/abonnement?toegevoegd=1`) : page(`/welkom?session_id={CHECKOUT_SESSION_ID}&business=${business.id}`),
    cancel_url: `${back}?betaling=geannuleerd`,
  });
  await db.logEvent(business.id, "checkout.started", { plan, sessionId: session.id });
  return NextResponse.redirect(session.url ?? back, 303);
}
