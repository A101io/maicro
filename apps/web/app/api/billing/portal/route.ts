import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { getSession, getOwnedBusiness } from "@/lib/session";

/** POST → Stripe customer portal for invoices; mock mode returns to the dashboard. */
export async function POST() {
  const session = await getSession();
  const business = session ? await getOwnedBusiness(session) : null;
  if (!business) return NextResponse.redirect(`${env.baseUrl}/inloggen?next=/app`, 303);
  const stripe = await getStripe();
  if (!stripe || !business.stripeCustomerId) return NextResponse.redirect(`${env.baseUrl}/app?facturen=mock`, 303);
  const portal = await stripe.billingPortal.sessions.create({ customer: business.stripeCustomerId, return_url: `${env.baseUrl}/app`, locale: "nl" });
  return NextResponse.redirect(portal.url, 303);
}
