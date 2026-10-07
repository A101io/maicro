import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { env } from "./env";
import { getSession, getOwnedBusiness, MOCK_SESSION_COOKIE, type Session } from "./session";
import type { BusinessRecord } from "@maicro/core/db";

/** Session + owned business, or redirect to /inloggen. */
export async function requireOwner(next = "/app"): Promise<{ session: Session; business: BusinessRecord }> {
  const session = await getSession();
  if (!session) redirect(`/inloggen?next=${encodeURIComponent(next)}`);
  const business = await getOwnedBusiness(session);
  if (!business) {
    if (!env.hasSupabase) (await cookies()).delete(MOCK_SESSION_COOKIE);
    redirect(`/inloggen?fout=geen&next=${encodeURIComponent(next)}`);
  }
  return { session, business };
}
