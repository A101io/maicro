import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { getSession } from "@/lib/session";

const SCOPES = ["https://www.googleapis.com/auth/business.manage"];

/** Starts Google OAuth for the Business Profile; in mock mode jumps straight to the callback. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.redirect(`${env.baseUrl}/inloggen?next=/app/google`);
  const redirectUri = `${env.baseUrl}/api/google/callback`;
  if (!env.hasGoogle) return NextResponse.redirect(`${redirectUri}?mock=1`);
  const state = randomBytes(16).toString("hex");
  (await cookies()).set("maicro_google_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.googleClientId!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return NextResponse.redirect(url.toString());
}
