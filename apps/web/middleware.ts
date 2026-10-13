import { NextResponse, type NextRequest } from "next/server";
import { fromUrl } from "@/lib/lang-paths";

/**
 * /en/... is the same page in English: rewrite to the Dutch route and tell
 * the page which language to render (x-maicro-lang) and which route it is
 * (x-maicro-route, for hreflang and the language switch).
 */
export function middleware(req: NextRequest) {
  const fromPath = fromUrl(req.nextUrl.pathname);
  // On Cloudflare (OpenNext) a rewrite runs the middleware a second time, on
  // the rewritten Dutch route: without this the second pass sets "nl" over the
  // first pass's "en". A visitor sending the header themselves only changes
  // the language of their own page.
  const prior = req.headers.get("x-maicro-lang");
  const keep = fromPath.lang === "nl" && prior === "en" && req.headers.get("x-maicro-route") === fromPath.route;
  const { lang, route } = keep ? { lang: "en" as const, route: fromPath.route } : fromPath;
  const headers = new Headers(req.headers);
  headers.set("x-maicro-lang", lang);
  headers.set("x-maicro-route", route);
  if (lang === "nl" || keep) return NextResponse.next({ request: { headers } });
  const url = req.nextUrl.clone();
  url.pathname = route;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Pages only: not the API, Next's own files, or files with an extension.
  matcher: ["/((?!api/|_next/|.*\\.[a-z0-9]+$).*)"],
};
