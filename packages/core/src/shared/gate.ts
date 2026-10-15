/**
 * The launch gate (go-live J4). While VIDALO_COMING_SOON=1 the marketing
 * pages show /binnenkort instead; everything a visitor may have a link to or
 * a right to keeps working: legal pages, the cookie statement, reports,
 * sign-in and the account, unsubscribe, the facts pages, the API.
 *
 * A browser with the preview cookie (set by the temporary button on
 * /binnenkort, or by /api/preview) sees the whole site. Pure, so the edge
 * middleware and the tests share it.
 */
export const COMING_SOON_ROUTE = "/binnenkort";
export const PREVIEW_COOKIE = "vidalo_preview";

/** Routes (Dutch, as the code names them) that the gate hides. Everything else passes. */
const GATED = ["/", "/prijzen", "/hoe-het-werkt", "/waarom", "/straks", "/vak", "/scan"] as const;

export function isGatedRoute(route: string): boolean {
  if (route === "/") return true;
  return GATED.some((g) => g !== "/" && (route === g || route.startsWith(g + "/")));
}

/** The route to render for `route`: the coming-soon page when the gate applies, else the route itself. */
export function gateRoute(route: string, state: { comingSoon: boolean; preview: boolean }): string {
  if (!state.comingSoon || state.preview) return route;
  return isGatedRoute(route) ? COMING_SOON_ROUTE : route;
}
