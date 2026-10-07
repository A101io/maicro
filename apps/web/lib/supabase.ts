import { cookies } from "next/headers";
import { env } from "./env";

type ServerClient = import("@supabase/supabase-js").SupabaseClient;

/** Supabase client bound to the request cookies (RLS as the signed-in user), or null when not configured. */
export async function createServerSupabase(): Promise<ServerClient | null> {
  if (!env.hasSupabase) return null;
  const { createServerClient } = await import("@supabase/ssr");
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          for (const { name, value, options } of list) cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
        } catch {
          // Called from a server component: cookies are refreshed by middleware instead.
        }
      },
    },
  }) as unknown as ServerClient;
}

/** Service-role client for writes that must bypass RLS (auth admin, linking owner_user_id). */
export async function createAdminSupabase(): Promise<ServerClient | null> {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null;
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { persistSession: false } });
}
