/**
 * Shared domain types for Maicro.
 * Facts are owner-asserted. Samples are evidence. Findings are the diff.
 */

export type BusinessStatus = "scanned" | "trial" | "active" | "paused" | "churned";

export interface Business {
  id: string;
  slug: string;
  name: string;
  place: string; // city / town
  domain: string | null;
  kvk: string | null;
  googlePlaceId: string | null;
  plan: "none" | "setup" | "monitor";
  status: BusinessStatus;
  ownerEmail: string | null;
  createdAt: string;
}

export interface Hours {
  /** 0 = Monday … 6 = Sunday */
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string | null; // "09:00"
  close: string | null; // "17:00"
  closed: boolean;
}

export interface PriceItem {
  label: string;
  amount: number; // EUR
  unit?: string; // "per uur", "per stuk"
}

export interface Facts {
  businessId: string;
  version: number;
  verifiedAt: string | null; // null = provisional (scraped, not confirmed)
  provisional: boolean;
  name: string;
  place: string;
  address: string | null;
  postcode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  openStatus: "open" | "temporarily_closed" | "permanently_closed";
  hours: Hours[];
  servicesYes: string[];
  servicesNo: string[];
  prices: PriceItem[];
  policies: string[]; // "Alleen op afspraak", "Pinnen mogelijk"
  paymentMethods: string[];
  notConfusedWith: string[]; // disambiguation lines
}

/** Keys an engine's claim can be matched to. */
export type FactKey =
  | "existence" // open / closed / exists
  | "hours"
  | "phone"
  | "address"
  | "website"
  | "service" // services yes/no
  | "price"
  | "policy"
  | "payment";

export type PromptCategory = FactKey;

export interface Prompt {
  id: string;
  businessId: string;
  category: PromptCategory;
  textNl: string;
  /** which fact field(s) this prompt probes, e.g. "hours.6" or "service:verhuur" */
  probes: string[];
  active: boolean;
}

export type Engine = "chatgpt" | "gemini" | "perplexity" | "google_ai" | "copilot";

export const ENGINES: Engine[] = ["chatgpt", "gemini", "perplexity", "google_ai", "copilot"];

export const ENGINE_LABEL: Record<Engine, string> = {
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_ai: "Google AI",
  copilot: "Copilot",
};

export interface Sample {
  id: string;
  scanRunId: string;
  promptId: string;
  engine: Engine;
  answerText: string;
  citations: string[]; // URLs the engine cited, if any
  capturedAt: string;
  costCents: number;
}

export interface Claim {
  sampleId: string;
  factKey: FactKey;
  /** normalised value, e.g. "closed" | "09:00-17:00" | "+31612345678" | "yes" | "no" | "12.50" */
  value: string;
  /** sub-key, e.g. "6" for Sunday, "verhuur" for a service */
  subject: string | null;
  confidence: number; // 0..1
  otherEntity: boolean; // answer is about a different business with the same name
  rawQuote: string;
}

export type SourceType = "owned_facts_page" | "owned_website" | "directory_api" | "directory_form" | "third_party" | "other_entity" | "none";

export type FindingStatus = "open" | "fixing" | "recheck" | "resolved" | "unfixable";

export interface Finding {
  id: string;
  businessId: string;
  scanRunId: string;
  factKey: FactKey;
  subject: string | null;
  engine: Engine;
  wrongValue: string;
  correctValue: string;
  /** how many of N samples carried the wrong value */
  frequency: number;
  sampleCount: number;
  sourceUrl: string | null;
  sourceType: SourceType;
  status: FindingStatus;
  firstSeenAt: string;
  resolvedAt: string | null;
  evidenceBefore: string | null; // sample id
  evidenceAfter: string | null; // sample id
}

export type ScanKind = "free" | "baseline" | "monthly" | "recheck" | "ondemand";

export interface ScanRun {
  id: string;
  businessId: string;
  kind: ScanKind;
  engines: Engine[];
  samplesPerPrompt: number;
  startedAt: string;
  finishedAt: string | null;
  costCents: number;
  status: "queued" | "running" | "done" | "failed";
}

export type FixAction = "republish" | "sync" | "form" | "email" | "manual" | "none";

export interface Fix {
  id: string;
  findingId: string;
  action: FixAction;
  target: string; // url / channel id / email address
  scheduledAt: string;
  sentAt: string | null;
  recheckAt: string | null;
  resolvedAt: string | null;
  evidence: Record<string, unknown>;
}

export type ChannelType = "facts_page" | "gbp" | "bing" | "apple" | "directory";

export interface Channel {
  id: string;
  businessId: string;
  type: ChannelType;
  name: string; // "Google Bedrijfsprofiel", "openingstijden.nl"
  externalId: string | null;
  url: string | null;
  status: "pending" | "synced" | "mismatch" | "failed" | "manual";
  lastSyncedAt: string | null;
}

/** Result of a scan as shown on the result page. */
export interface ScanReport {
  business: Pick<Business, "id" | "slug" | "name" | "place">;
  scanRunId: string;
  kind: ScanKind;
  checkedAt: string;
  totalAnswers: number;
  wrongAnswers: number;
  engines: { engine: Engine; correct: number; wrong: number; skipped: boolean }[];
  findings: Finding[];
  correct: { prompt: string; engine: Engine; value: string }[];
}
