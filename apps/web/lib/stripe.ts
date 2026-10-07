import { env } from "./env";

type StripeClient = import("stripe").default;

/** Stripe client or null in mock mode (no STRIPE_SECRET_KEY). */
export async function getStripe(): Promise<StripeClient | null> {
  if (!env.hasStripe) return null;
  const { default: Stripe } = await import("stripe");
  return new Stripe(env.stripeSecretKey!);
}
