import Link from "next/link";
import { getLang, getRoute, localizeHref } from "@/lib/i18n";
import { LANGS } from "@/lib/lang-paths";

/**
 * NL · EN: the same page in the other language. Plain links, so it keeps
 * the session (cookies are per site, not per language) and works without
 * script.
 */
export async function LangSwitch({ className = "" }: { className?: string }) {
  const [lang, route] = [await getLang(), await getRoute()];
  return (
    <span className={`lang-switch ${className}`}>
      {LANGS.map((l) => (
        <Link key={l} href={localizeHref(route, l)} hrefLang={l} lang={l} aria-current={l === lang ? "true" : undefined} className={l === lang ? "is-current" : ""}>
          {l.toUpperCase()}
        </Link>
      ))}
    </span>
  );
}
