/**
 * Cookie consent, shared by the notice (components/CookieConsent.tsx) and
 * anything that may only run after consent. Pure: no DOM here.
 *
 * Today the site sets necessary cookies only, so the notice informs and asks
 * nothing (Telecommunicatiewet art. 11.7a: no consent needed for functional
 * cookies). The moment a category below is listed in OPTIONAL_CATEGORIES the
 * notice shows a refuse button next to an accept button, same size, refuse
 * first, nothing fires before the choice (LEGAL-NL §6). Add the category to
 * copy.legal.cookies' table in the same change.
 */
export const CONSENT_COOKIE = "vidalo_consent";
export const CONSENT_VERSION = 1;
/** Twelve months, in seconds. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentCategory = "necessary" | "analytics";
export const OPTIONAL_CATEGORIES: readonly Exclude<ConsentCategory, "necessary">[] = [];

export interface Consent {
  v: number;
  at: string;
  necessary: true;
  analytics: boolean;
}

export function parseConsent(raw: string | undefined | null): Consent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as Partial<Consent>;
    if (value.v !== CONSENT_VERSION || typeof value.at !== "string") return null;
    return { v: CONSENT_VERSION, at: value.at, necessary: true, analytics: value.analytics === true };
  } catch {
    return null;
  }
}

export function serializeConsent(choice: { analytics: boolean }, now = new Date()): string {
  const value: Consent = { v: CONSENT_VERSION, at: now.toISOString(), necessary: true, analytics: choice.analytics };
  return encodeURIComponent(JSON.stringify(value));
}

/** The Set-Cookie value for a consent. SameSite=Lax, a year, the whole site; Secure on https. */
export function consentCookie(choice: { analytics: boolean }, secure: boolean, now = new Date()): string {
  return `${CONSENT_COOKIE}=${serializeConsent(choice, now)}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}
