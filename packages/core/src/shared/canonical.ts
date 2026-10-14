/**
 * One address for the website. vidalo.io is the domain (registered 14 Oct
 * 2026; vidalo.nl and vidalo.com are held by others); www.vidalo.io is bound
 * to the same web Worker and answers with a permanent redirect to the same
 * path on vidalo.io, so search engines and AI crawlers see one site.
 *
 * workers.dev and localhost are left alone: they are how a deploy is checked
 * and how the app runs in development, and must keep answering themselves.
 */
export const CANONICAL_HOST = "vidalo.io";

/** The hosts that redirect to CANONICAL_HOST. Each one is a custom domain in apps/web/wrangler.jsonc. */
export const REDIRECT_HOSTS = ["www.vidalo.io"] as const;

/** The redirect target for a request URL, or null when it is already on the right host. */
export function canonicalRedirect(requestUrl: string, canonicalHost: string = CANONICAL_HOST): string | null {
  const url = new URL(requestUrl);
  const host = url.hostname.toLowerCase();
  if (host === canonicalHost) return null;
  if (!(REDIRECT_HOSTS as readonly string[]).includes(host)) return null;
  return `https://${canonicalHost}${url.pathname}${url.search}`;
}
