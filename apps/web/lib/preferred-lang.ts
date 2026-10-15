import { redirect } from "next/navigation";
import type { BusinessRecord } from "@vidalo/core/db";
import { getLang, getRoute } from "./i18n";
import { localizeHref } from "./lang-paths";

/**
 * A signed-in owner reads Vidalo in the language saved on the account
 * (business.language): the dashboard and the report; e-mails are still Dutch. When a page is
 * opened in the other language, send them to the same page in theirs. The
 * NL · EN switch saves the choice first (/api/lang), so it never fights this.
 */
export async function followPreferredLang(business: Pick<BusinessRecord, "language">): Promise<void> {
  // A record without the field (an in-memory business created before the column existed) reads as Dutch.
  const preferred = business.language ?? "nl";
  const lang = await getLang();
  if (lang === preferred) return;
  redirect(localizeHref(await getRoute(), preferred));
}
