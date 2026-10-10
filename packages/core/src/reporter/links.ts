/**
 * Customer-facing URLs. The web app (apps/web) owns the routes:
 *   /app            dashboard          /app/gegevens  facts confirmation
 *   /app/google     Google login       /app/domein    domain step
 *   /r/{scanRunId}  public result      /inloggen      magic-link login
 * Override the base with PUBLIC_BASE_URL.
 */
import type { BusinessRecord } from "../db/types.js";
import { defaultFactsHost } from "../publisher/render.js";
import { unsubscribeToken } from "../shared/unsubscribe.js";

export function baseUrl(): string {
  return (process.env.PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function dashboardUrl(_business?: Pick<BusinessRecord, "slug">): string {
  return `${baseUrl()}/app`;
}

export function confirmFactsUrl(_business?: Pick<BusinessRecord, "slug">): string {
  return `${baseUrl()}/app/gegevens`;
}

export function googleConnectUrl(_business?: Pick<BusinessRecord, "slug">): string {
  return `${baseUrl()}/app/google`;
}

export function domainUrl(_business?: Pick<BusinessRecord, "slug">): string {
  return `${baseUrl()}/app/domein`;
}

export function loginUrl(next?: string): string {
  return `${baseUrl()}/inloggen${next ? `?next=${encodeURIComponent(next)}` : ""}`;
}

/** Public result page for a scan run (valid 30 days for non-customers). */
export function resultUrl(scanRunIdOrBusiness: string | (Pick<BusinessRecord, "slug"> & { scanRunId?: string })): string {
  const id = typeof scanRunIdOrBusiness === "string" ? scanRunIdOrBusiness : (scanRunIdOrBusiness.scanRunId ?? scanRunIdOrBusiness.slug);
  return `${baseUrl()}/r/${id}`;
}

export function factsPageUrl(business: Pick<BusinessRecord, "slug" | "factsHost">): string {
  return `https://${business.factsHost ?? defaultFactsHost(business)}/`;
}

/** Opt-out page for the follow-up mails; signed, see shared/unsubscribe.ts. */
export function unsubscribeUrl(business: Pick<BusinessRecord, "id">): string {
  return `${baseUrl()}/afmelden?b=${encodeURIComponent(business.id)}&t=${unsubscribeToken(business.id)}`;
}

/** RFC 8058 one-click target that mail apps POST to. */
export function unsubscribeOneClickUrl(business: Pick<BusinessRecord, "id">): string {
  return `${baseUrl()}/api/afmelden?b=${encodeURIComponent(business.id)}&t=${unsubscribeToken(business.id)}`;
}
