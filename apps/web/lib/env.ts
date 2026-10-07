/** Centralised env access. Every external SDK is guarded by one of these flags. */

const read = (k: string): string | undefined => {
  const v = process.env[k];
  return v && v.trim() !== "" ? v.trim() : undefined;
};

export const env = {
  get mock(): boolean {
    return read("MAICRO_MOCK") === "1" || !read("DATABASE_URL");
  },
  get baseUrl(): string {
    return read("PUBLIC_BASE_URL") ?? "http://localhost:3000";
  },
  get databaseUrl() {
    return read("DATABASE_URL");
  },
  get supabaseUrl() {
    return read("SUPABASE_URL") ?? read("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return read("SUPABASE_ANON_KEY") ?? read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return read("SUPABASE_SERVICE_ROLE_KEY");
  },
  get hasSupabase(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseAnonKey);
  },
  get stripeSecretKey() {
    return read("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret() {
    return read("STRIPE_WEBHOOK_SECRET");
  },
  get stripePriceSetup() {
    return read("STRIPE_PRICE_SETUP");
  },
  get stripePriceMonitor() {
    return read("STRIPE_PRICE_MONITOR");
  },
  get hasStripe(): boolean {
    return Boolean(this.stripeSecretKey);
  },
  get googleClientId() {
    return read("GOOGLE_OAUTH_CLIENT_ID");
  },
  get googleClientSecret() {
    return read("GOOGLE_OAUTH_CLIENT_SECRET");
  },
  get hasGoogle(): boolean {
    return Boolean(this.googleClientId && this.googleClientSecret);
  },
};
