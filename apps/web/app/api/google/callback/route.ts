import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { ready } from "@/lib/db";
import { getSession, getOwnedBusiness } from "@/lib/session";

/** First Business Profile location of the signed-in account ("locations/123..."), or a mock name. */
async function lookupLocationName(accessToken: string): Promise<string | null> {
  if (!env.hasGoogle) return "locations/mock-1";
  try {
    const acc = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", { headers: { authorization: `Bearer ${accessToken}` } });
    if (!acc.ok) return null;
    const accounts = ((await acc.json()) as { accounts?: { name: string }[] }).accounts ?? [];
    for (const a of accounts) {
      const loc = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${a.name}/locations?readMask=name,title&pageSize=1`, { headers: { authorization: `Bearer ${accessToken}` } });
      if (!loc.ok) continue;
      const first = ((await loc.json()) as { locations?: { name: string }[] }).locations?.[0];
      if (first) return first.name;
    }
  } catch {
    /* leave externalId empty; the sync adapter will look it up */
  }
  return null;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}

/** OAuth callback: exchanges the code (behind env), stores tokens on the gbp channel's meta, enqueues a sync. */
export async function GET(req: Request) {
  const session = await getSession();
  const business = session ? await getOwnedBusiness(session) : null;
  if (!business) return NextResponse.redirect(`${env.baseUrl}/inloggen?next=/app/google`);
  const url = new URL(req.url);
  const back = `${env.baseUrl}/app/google`;

  let tokens: TokenResponse | null = null;
  if (url.searchParams.get("mock") === "1" || !env.hasGoogle) {
    tokens = { access_token: "mock-access", refresh_token: "mock-refresh", expires_in: 3600, scope: "business.manage" };
  } else {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const expected = (await cookies()).get("maicro_google_state")?.value;
    if (!code || !state || state !== expected) return NextResponse.redirect(`${back}?fout=1`);
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.googleClientId!,
        client_secret: env.googleClientSecret!,
        redirect_uri: `${env.baseUrl}/api/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) return NextResponse.redirect(`${back}?fout=1`);
    tokens = (await res.json()) as TokenResponse;
  }

  const db = await ready();
  const locationName = await lookupLocationName(tokens.access_token);
  const channel = await db.upsertChannel({
    businessId: business.id,
    type: "gbp",
    name: "Google Bedrijfsprofiel",
    externalId: locationName,
    url: null,
    status: "pending",
    lastSyncedAt: null,
    meta: { refreshToken: tokens.refresh_token ?? null, accessToken: tokens.access_token, expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(), scope: tokens.scope, mock: !env.hasGoogle },
  });
  await db.enqueueJob("sync", { businessId: business.id, channelIds: [channel.id] });
  await db.logEvent(business.id, "google.connected", { mock: !env.hasGoogle });
  return NextResponse.redirect(`${back}?gekoppeld=1`);
}
