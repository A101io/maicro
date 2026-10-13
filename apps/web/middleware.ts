import { NextResponse, type NextRequest } from "next/server";
import { fromUrl } from "@/lib/lang-paths";

/**
 * /en/... is the same page in English: rewrite to the Dutch route and tell
 * the page which language to render (x-maicro-lang) and which route it is
 * (x-maicro-route, for hreflang and the language switch).
 */
export function middleware(req: NextRequest) {
  const { lang, route } = fromUrl(req.nextUrl.pathname);
  const headers = new Headers(req.headers);
  headers.set("x-maicro-lang", lang);
  headers.set("x-maicro-route", route);
  if (lang === "nl") return NextResponse.next({ request: { headers } });
  const url = req.nextUrl.clone();
  url.pathname = route;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Pages only: not the API, Next's own files, or files with an extension.
  matcher: ["/((?!api/|_next/|.*\\.[a-z0-9]+$).*)"],
};
