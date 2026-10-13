/**
 * One address for the website. vidalo.nl is the main domain; www.vidalo.nl,
 * vidalo.com and vidalo.io (with or without www) are bound to the same web
 * Worker and answer with a permanent redirect to the same path on vidalo.nl,
 * so search engines and AI crawlers see one site, not four copies.
 *
 * workers.dev and localhost are left alone: they are how a deploy is checked
 * and how the app runs in development, and must keep answering themselves.
 */
export const CANONICAL_HOST = "vidalo.nl";

/** The hosts that redirect to CANONICAL_HOST. Each one is a custom domain in apps/web/wrangler.jsonc. */
export const REDIRECT_HOSTS = ["www.vidalo.nl", "vidalo.com", "www.vidalo.com", "vidalo.io", "www.vidalo.io"] as const;

/** The redirect target for a request URL, or null when it is already on the right host. */
export function canonicalRedirect(requestUrl: string, canonicalHost: string = CANONICAL_HOST): string | null {
  const url = new URL(requestUrl);
  const host = url.hostname.toLowerCase();
  if (host === canonicalHost) return null;
  if (!(REDIRECT_HOSTS as readonly string[]).includes(host)) return null;
  return `https://${canonicalHost}${url.pathname}${url.search}`;
}
