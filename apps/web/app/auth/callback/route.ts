import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase";

/** Supabase magic-link callback: exchanges the code for a session cookie, then continues to `next`. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  const supabase = await createServerSupabase();
  if (supabase && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${env.baseUrl}/inloggen?fout=1`);
  }
  return NextResponse.redirect(`${env.baseUrl}${next.startsWith("/") ? next : "/app"}`);
}
