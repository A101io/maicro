import { cookies } from "next/headers";
import { env } from "./env";
import { createServerSupabase } from "./supabase";
import { ready } from "./core";
import type { BusinessRecord } from "@maicro/core/db";

export const MOCK_SESSION_COOKIE = "maicro_mock_session";

export interface Session {
  userId: string;
  email: string;
}

/** Current signed-in user: Supabase auth when configured, else a mock cookie set by /inloggen. */
export async function getSession(): Promise<Session | null> {
  const supabase = await createServerSupabase();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user?.email) return { userId: data.user.id, email: data.user.email };
    return null;
  }
  if (!env.hasSupabase) {
    const store = await cookies();
    const raw = store.get(MOCK_SESSION_COOKIE)?.value;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Session>;
        if (parsed.userId && parsed.email) return { userId: parsed.userId, email: parsed.email };
      } catch {
        /* ignore */
      }
    }
  }
  return null;
}

/** The business owned by the session user, linking owner_user_id on first visit. */
export async function getOwnedBusiness(session: Session): Promise<BusinessRecord | null> {
  const db = await ready();
  let b = await db.getBusinessByOwner({ userId: session.userId });
  if (!b) {
    b = await db.getBusinessByOwner({ email: session.email });
    if (b && !b.ownerUserId) b = await db.upsertBusiness({ id: b.id, slug: b.slug, name: b.name, place: b.place, ownerUserId: session.userId });
  }
  return b;
}
