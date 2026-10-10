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
  const rawNext = String(form.get("next") ?? "/app");
  // Only same-site paths: "next" comes from the query string.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/\\") ? rawNext : "/app";
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
  const store = await cookies();
  if (next.startsWith("/eigenaar/bevestigen")) {
    // Claiming a business: ownership is proven by Google next, not by owning one already.
    store.set(MOCK_SESSION_COOKIE, JSON.stringify({ userId: `mock-${email}`, email }), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    redirect(next);
  }
  if (businessId) {
    const b = await db.getBusiness(businessId);
    if (b && !b.ownerEmail) await db.upsertBusiness({ id: b.id, slug: b.slug, name: b.name, place: b.place, ownerEmail: email });
  }
  const owned = await db.getBusinessByOwner({ email });
  if (!owned) {
    store.delete(MOCK_SESSION_COOKIE);
    redirect(`/inloggen?fout=geen&${q}`);
  }
  store.set(MOCK_SESSION_COOKIE, JSON.stringify({ userId: owned.ownerUserId ?? `mock-${email}`, email }), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect(next);
}
