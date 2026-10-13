/**
 * Source attribution: for each finding, find which cited page carries the
 * wrong value and classify that page by hostname into a SourceType, which
 * decides the fix path (see ARCHITECTURE.md, workflow D).
 */
import type { Business, FactKey, SourceType } from "../types";
import type { FindingCandidate } from "./compare";
import { DAY_NAMES_NL, normalizeWebsite } from "./normalize";
import { fetchText, htmlToText } from "./util";

/** Dutch directories reachable via a form / account, not an API. */
export const DIRECTORY_FORM_HOSTS = [
  "openingstijden.nl",
  "telefoonboek.nl",
  "detelefoongids.nl",
  "cylex.nl",
  "cylex-bedrijvengids.nl",
  "kvk.nl",
  "oozo.nl",
  "bedrijvenpagina.nl",
  "yelp.com",
  "yelp.nl",
  "tripadvisor.com",
  "tripadvisor.nl",
  "facebook.com",
  "openingstijden.com",
  "openingstijdengids.nl",
  "bedrijvenbank.nl",
  "indebuurt.nl",
  "drimble.nl",
];

/** Directories we can sync through an API / official channel. */
export const DIRECTORY_API_HOSTS = ["google.com", "google.nl", "bing.com", "apple.com", "maps.apple.com"];

export interface AttributionContext {
  business: Pick<Business, "domain" | "slug" | "name">;
  /** Host of the published facts page, e.g. "feiten.bakkerijdevries.nl". */
  factsHost?: string | null;
  /** The business website host (from facts.website) if not equal to business.domain. */
  websiteHost?: string | null;
}

export interface Attribution {
  sourceUrl: string | null;
  sourceType: SourceType;
}

const hostOf = (url: string): string | null => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
};

const sameOrSub = (host: string, base: string) => host === base || host.endsWith(`.${base}`);

/** Classify a URL purely by its hostname. */
export function classifyHost(url: string, ctx: AttributionContext): SourceType {
  const host = hostOf(url);
  if (!host) return "third_party";
  const factsHost = ctx.factsHost ? ctx.factsHost.toLowerCase().replace(/^www\./, "") : null;
  if (factsHost && sameOrSub(host, factsHost)) return "owned_facts_page";
  if (factsHost == null && /^feiten\./.test(host)) return "owned_facts_page";
  const owned = [ctx.business.domain, ctx.websiteHost].map((d) => (d ? normalizeWebsite(d) : null)).filter((d): d is string => Boolean(d));
  if (owned.some((d) => sameOrSub(host, d))) return "owned_website";
  if (DIRECTORY_API_HOSTS.some((d) => sameOrSub(host, d))) {
    // Only the places / maps parts of these hosts are directories.
    if (host.includes("google") && !/\/maps|maps\.google|business\.google|g\.page/.test(url)) return "directory_api";
    return "directory_api";
  }
  if (DIRECTORY_FORM_HOSTS.some((d) => sameOrSub(host, d))) return "directory_form";
  return "third_party";
}

/**
 * Does a page's text contain the wrong value? Phone -> digits (ignoring
 * separators); hours -> "gesloten" near the day name or the time string;
 * service -> the service word; existence -> "gesloten"; otherwise substring.
 */
export function textContainsValue(text: string, factKey: FactKey, subject: string | null, wrongValue: string): boolean {
  const lower = text.toLowerCase();
  switch (factKey) {
    case "phone": {
      const digits = wrongValue.replace(/\D/g, "").replace(/^31/, "");
      const pageDigits = lower.replace(/[\s\-().]/g, "");
      return digits.length >= 9 && (pageDigits.includes(digits) || pageDigits.includes(`0${digits}`));
    }
    case "hours": {
      const day = subject != null ? DAY_NAMES_NL[Number(subject)] : null;
      if (wrongValue === "closed") {
        if (!day) return /gesloten/.test(lower);
        const re = new RegExp(`${day}[^\\n]{0,60}gesloten|gesloten[^\\n]{0,60}${day}`, "i");
        return re.test(lower);
      }
      const [open, close] = wrongValue.split("-");
      const near = day ? lower.indexOf(day) : 0;
      const window = near >= 0 ? lower.slice(Math.max(0, near - 20), near + 120) : lower;
      return Boolean(open && close && window.includes(open) && window.includes(close));
    }
    case "service":
    case "policy":
      return subject != null && lower.includes(subject.toLowerCase());
    case "payment":
      return wrongValue === "no" ? /alleen contant|geen pin/.test(lower) : /pin/.test(lower);
    case "existence":
      return wrongValue === "open" ? /\bopen\b/.test(lower) : /gesloten|dicht|opgeheven|failliet/.test(lower);
    case "address": {
      const street = wrongValue.match(/^(.+?\d+\s?[a-z]?)\b/)?.[1] ?? wrongValue;
      return lower.replace(/\s+/g, " ").includes(street);
    }
    case "website":
      return lower.includes(wrongValue.toLowerCase());
    default:
      return lower.includes(wrongValue.toLowerCase());
  }
}

export interface AttributeOptions {
  /** Do not fetch pages; classify by hostname only (mock mode default). */
  offline?: boolean;
  fetch?: (url: string) => Promise<string | null>;
  timeoutMs?: number;
  maxBytes?: number;
}

/** Attribute one finding candidate to a source URL and type. */
export async function attributeFinding(candidate: FindingCandidate, ctx: AttributionContext, opts: AttributeOptions = {}): Promise<Attribution> {
  // Not found: there is no page carrying a wrong value; the engine simply has nothing.
  if (candidate.verdict === "not_found") return { sourceUrl: null, sourceType: "none" };
  // Not named in a recommendation: no page carries "niet genoemd"; the remedy is the facts page (fixer RECOMMENDATION_PATH).
  if (candidate.evidenceKind === "recommendation") return { sourceUrl: null, sourceType: "none" };
  if (candidate.sourceType === "other_entity") {
    return { sourceUrl: candidate.citations[0] ?? null, sourceType: "other_entity" };
  }
  const citations = candidate.citations.filter((u) => /^https?:\/\//i.test(u));
  if (!citations.length) return { sourceUrl: null, sourceType: "none" };

  const offline = opts.offline ?? process.env.VIDALO_MOCK === "1";
  if (!offline) {
    const fetchFn = opts.fetch ?? ((url: string) => fetchText(url, { timeoutMs: opts.timeoutMs ?? 8_000, maxBytes: opts.maxBytes ?? 200_000 }));
    for (const url of citations.slice(0, 8)) {
      const body = await fetchFn(url);
      if (!body) continue;
      const text = htmlToText(body);
      if (textContainsValue(text, candidate.factKey, candidate.subject, candidate.wrongValue)) {
        return { sourceUrl: url, sourceType: classifyHost(url, ctx) };
      }
    }
  }
  // Offline, or no fetched page carried the value: the first citation is still the most likely source.
  const url = citations[0]!;
  return { sourceUrl: url, sourceType: classifyHost(url, ctx) };
}

export type AttributedFinding = Omit<FindingCandidate, "sourceType"> & Attribution;

/** Attribute a batch sequentially per finding (fetches are already bounded). */
export async function attributeAll(candidates: FindingCandidate[], ctx: AttributionContext, opts: AttributeOptions = {}): Promise<AttributedFinding[]> {
  const out: AttributedFinding[] = [];
  for (const c of candidates) out.push({ ...c, ...(await attributeFinding(c, ctx, opts)) });
  return out;
}
