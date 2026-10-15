import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { ready } from "@/lib/db";
import { getSession, getOwnedBusiness } from "@/lib/session";
import { LANGS, localizeHref, type Lang } from "@/lib/lang-paths";

/**
 * The NL · EN switch for a signed-in owner: saves the language on the account
 * and continues to the same page in that language. Not signed in: just the
 * redirect, so the link works for everyone.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to") as Lang | null;
  const next = url.searchParams.get("next") ?? "/";
  const route = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (!to || !LANGS.includes(to)) return NextResponse.redirect(`${env.baseUrl}${route}`, 303);
  const session = await getSession();
  const business = session ? await getOwnedBusiness(session) : null;
  if (business && business.language !== to) {
    const db = await ready();
    await db.upsertBusiness({ id: business.id, slug: business.slug, name: business.name, place: business.place, language: to });
    await db.logEvent(business.id, "account.language_set", { language: to });
  }
  return NextResponse.redirect(`${env.baseUrl}${localizeHref(route, to)}`, 303);
}
