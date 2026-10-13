import type { Lang } from "./lang-paths";
import { fromUrl } from "./lang-paths";

/**
 * The language of the page a form was posted from. API routes sit outside the
 * middleware (no x-vidalo-lang), so they read it off the Referer: a POST from
 * /en/... answers and redirects in English. No or foreign Referer: Dutch.
 */
export function langFromReferer(req: Request): Lang {
  const ref = req.headers.get("referer");
  if (!ref) return "nl";
  try {
    return fromUrl(new URL(ref).pathname).lang;
  } catch {
    return "nl";
  }
}
