/**
 * Facts page helpers for the owner preview. Rendering is done by the core
 * publisher (`renderFactsPage(facts, business, { host })`).
 */
import type { Business, Facts } from "@vidalo/core/types";
import { renderFactsPage as coreRenderFactsPage, preferredFactsHost, cnameTarget } from "@vidalo/core/publisher";

export interface RenderedFactsPage {
  html: string;
  jsonLd: Record<string, unknown>;
  llmsTxt: string;
}

export function factsHostFor(business: Pick<Business, "slug" | "domain"> & { factsHost?: string | null }): string {
  return business.factsHost ?? preferredFactsHost(business);
}

export { cnameTarget };

export function renderFactsPage(facts: Facts, business: Business & { factsHost?: string | null }): RenderedFactsPage {
  const { html, jsonLd, llmsTxt } = coreRenderFactsPage(facts, business, { host: factsHostFor(business) });
  return { html, jsonLd, llmsTxt };
}

/** Body-only HTML for embedding the preview inside the app chrome. */
export function factsPageBody(facts: Facts, business: Business & { factsHost?: string | null }): string {
  const { html } = renderFactsPage(facts, business);
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  return m?.[1] ?? html;
}
