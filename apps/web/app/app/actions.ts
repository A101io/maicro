"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ready } from "@/lib/db";
import { requireVerifiedOwner } from "@/lib/owner";

/** "Controleer nu": enqueue an on-demand scan for the owner's business. */
export async function checkNow() {
  const { business } = await requireVerifiedOwner();
  const db = await ready();
  await db.enqueueJob("scan", { businessId: business.id, kind: "ondemand", then: ["fixes"] });
  await db.logEvent(business.id, "scan.ondemand_requested", {});
  revalidatePath("/app");
  redirect("/app?controle=ingepland");
}

/** Option B on the domain page: let Maicro register a domain. */
export async function registerDomain() {
  const { business } = await requireVerifiedOwner("/app/domein");
  const db = await ready();
  await db.enqueueJob("operator_task", { reason: "domain_register", businessId: business.id, suggestion: `${business.slug}.nl` });
  await db.logEvent(business.id, "domain.register_requested", {});
  revalidatePath("/app/domein");
  redirect("/app/domein?registreren=ingepland");
}
