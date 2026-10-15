"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ready } from "@/lib/db";
import { getI18n } from "@/lib/i18n";
import { requireOwner, requireVerifiedOwner } from "@/lib/owner";
import { LANGS, localizeHref, type Lang } from "@/lib/lang-paths";

/** The language row on the account page: save it, then show the account in that language. */
export async function setLanguage(formData: FormData) {
  const { business } = await requireOwner("/app/account");
  const to = String(formData.get("language") ?? "") as Lang;
  if (!LANGS.includes(to)) redirect((await getI18n()).href("/app/account"));
  if (business.language !== to) {
    const db = await ready();
    await db.upsertBusiness({ id: business.id, slug: business.slug, name: business.name, place: business.place, language: to });
    await db.logEvent(business.id, "account.language_set", { language: to });
  }
  revalidatePath("/app/account");
  redirect(localizeHref("/app/account?taal=opgeslagen", to));
}

/** "Controleer nu": enqueue an on-demand scan for the owner's business. */
export async function checkNow() {
  const { business } = await requireVerifiedOwner();
  const db = await ready();
  await db.enqueueJob("scan", { businessId: business.id, kind: "ondemand", then: ["fixes"] });
  await db.logEvent(business.id, "scan.ondemand_requested", {});
  revalidatePath("/app");
  redirect((await getI18n()).href("/app?controle=ingepland"));
}

/** Option B on the domain page: let Vidalo register a domain. */
export async function registerDomain() {
  const { business } = await requireVerifiedOwner("/app/domein");
  const db = await ready();
  await db.enqueueJob("operator_task", { reason: "domain_register", businessId: business.id, suggestion: `${business.slug}.nl` });
  await db.logEvent(business.id, "domain.register_requested", {});
  revalidatePath("/app/domein");
  redirect((await getI18n()).href("/app/domein?registreren=ingepland"));
}
