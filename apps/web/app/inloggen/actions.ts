"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { isEmail } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase";
import { MOCK_SESSION_COOKIE } from "@/lib/session";
import { ready } from "@/lib/db";

export async function sendMagicLink(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const next = String(form.get("next") ?? "/app");
  const businessId = String(form.get("business") ?? "");
  const q = `next=${encodeURIComponent(next)}`;
  if (!isEmail(email)) redirect(`/inloggen?fout=1&${q}`);

  const supabase = await createServerSupabase();
  if (supabase) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${env.baseUrl}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) redirect(`/inloggen?fout=1&${q}`);
    redirect(`/inloggen?sent=1`);
  }

  // Mock auth: sign in immediately as this e-mail, linking the business that was just bought if it has no owner yet.
  const db = await ready();
  if (businessId) {
    const b = await db.getBusiness(businessId);
    if (b && !b.ownerEmail) await db.upsertBusiness({ id: b.id, slug: b.slug, name: b.name, place: b.place, ownerEmail: email });
  }
  const owned = await db.getBusinessByOwner({ email });
  const store = await cookies();
  if (!owned) {
    store.delete(MOCK_SESSION_COOKIE);
    redirect(`/inloggen?fout=geen&${q}`);
  }
  store.set(MOCK_SESSION_COOKIE, JSON.stringify({ userId: owned.ownerUserId ?? `mock-${email}`, email }), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect(next);
}
