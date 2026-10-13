import { headers } from "next/headers";
import { copyFor } from "@maicro/core/copy";
import { DEFAULT_LANG, LANGS, localizeHref, type Lang } from "./lang-paths";

export { localizeHref, type Lang };

/** The language this request renders in (set by middleware.ts). */
export async function getLang(): Promise<Lang> {
  const h = (await headers()).get("x-maicro-lang");
  return (LANGS as readonly string[]).includes(h ?? "") ? (h as Lang) : DEFAULT_LANG;
}

/** The copy for this request's language. */
export async function getCopy() {
  return copyFor(await getLang());
}

/** Everything a server component needs: the copy, the language, and a link maker. */
export async function getI18n() {
  const lang = await getLang();
  return { lang, copy: copyFor(lang), href: (h: string) => localizeHref(h, lang) };
}

/** The Dutch route of this request, for hreflang and the language switch. */
export async function getRoute(): Promise<string> {
  return (await headers()).get("x-maicro-route") ?? "/";
}
