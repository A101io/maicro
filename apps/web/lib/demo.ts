/**
 * Demo content. Two things live here:
 *  1. `demoReport()`: a static, fictional ScanReport for the landing page example
 *     (never touches the database).
 *  2. `seedDemo(db)`: in mock mode, creates the fictional owner business
 *     (login: eigenaar@bakkerijdevries.nl) with a finished free scan so the
 *     dashboard and `/r/voorbeeld` (→ latest run) have content.
 */
import type { Db } from "@maicro/core/db";
import type { Engine, Finding, ScanReport } from "@maicro/core/types";
import { prepareBusiness, runScan } from "@maicro/core/scanner";

export const DEMO_OWNER_EMAIL = "eigenaar@bakkerijdevries.nl";
export const DEMO_SLUG = "bakkerij-de-vries-haarlem";

const checkedAt = new Date().toISOString();
const base = { businessId: "demo", scanRunId: "demo", sampleCount: 3, verdict: "wrong" as const, resolvedAt: null, evidenceBefore: null, evidenceAfter: null, status: "open" as const, firstSeenAt: checkedAt };

export const demoFindings: Finding[] = [
  { ...base, id: "f-demo-1", factKey: "hours", subject: "6", engine: "chatgpt", wrongValue: "zondag geopend van 9:00 tot 17:00", correctValue: "zondag gesloten", frequency: 3, sourceUrl: "https://openingstijden.nl/haarlem/bakkerij-de-vries", sourceType: "directory_form" },
  { ...base, id: "f-demo-2", factKey: "phone", subject: null, engine: "copilot", wrongValue: "023 532 00 41", correctValue: "023 531 22 18", frequency: 2, sourceUrl: "https://www.telefoonboek.nl/bedrijven/haarlem/bakkerij-de-vries", sourceType: "third_party" },
  { ...base, id: "f-demo-3", factKey: "service", subject: "bezorgen", engine: "google_ai", wrongValue: "bezorgt in heel Haarlem", correctValue: "bezorgt niet", frequency: 3, sourceUrl: "https://bakkerijdevries.nl/corona-bezorgservice", sourceType: "owned_website" },
  { ...base, id: "f-demo-4", factKey: "address", subject: null, engine: "chatgpt", wrongValue: "Kruisstraat 8, Hoofddorp", correctValue: "Grote Houtstraat 112, Haarlem", frequency: 1, sourceUrl: null, sourceType: "other_entity" },
];

export const demoCorrect: ScanReport["correct"] = [
  { prompt: "Is Bakkerij De Vries in Haarlem op zondag open?", engine: "google_ai", value: "zondag gesloten" },
  { prompt: "Is Bakkerij De Vries in Haarlem op zondag open?", engine: "copilot", value: "zondag gesloten" },
  { prompt: "Wat is het telefoonnummer van Bakkerij De Vries in Haarlem?", engine: "chatgpt", value: "023 531 22 18" },
  { prompt: "Wat is het telefoonnummer van Bakkerij De Vries in Haarlem?", engine: "google_ai", value: "023 531 22 18" },
  { prompt: "Bezorgt Bakkerij De Vries in Haarlem ook?", engine: "chatgpt", value: "bezorgt niet" },
  { prompt: "Bezorgt Bakkerij De Vries in Haarlem ook?", engine: "copilot", value: "bezorgt niet" },
  { prompt: "Wat is het adres van Bakkerij De Vries in Haarlem?", engine: "google_ai", value: "Grote Houtstraat 112, Haarlem" },
  { prompt: "Wat is het adres van Bakkerij De Vries in Haarlem?", engine: "copilot", value: "Grote Houtstraat 112, Haarlem" },
];

export function demoReport(): ScanReport {
  const engines: Engine[] = ["chatgpt", "google_ai", "copilot"];
  return {
    business: { id: "demo", slug: DEMO_SLUG, name: "Bakkerij De Vries", place: "Haarlem" },
    scanRunId: "voorbeeld",
    kind: "free",
    checkedAt,
    totalAnswers: demoFindings.length + demoCorrect.length,
    wrongAnswers: demoFindings.length,
    notFoundAnswers: 0,
    visibility: "found",
    engines: engines.map((engine) => ({ engine, correct: demoCorrect.filter((c) => c.engine === engine).length, wrong: demoFindings.filter((f) => f.engine === engine).length, notFound: 0, skipped: false })),
    findings: demoFindings,
    correct: demoCorrect,
  };
}

/** Mock-mode owner business with one finished free scan. Idempotent. */
export async function seedDemo(db: Db): Promise<void> {
  if (await db.getBusiness(DEMO_SLUG)) return;
  const { business } = await prepareBusiness({ name: "Bakkerij De Vries", place: "Haarlem", db });
  await db.upsertBusiness({ id: business.id, slug: business.slug, name: business.name, place: business.place, ownerEmail: DEMO_OWNER_EMAIL, ownerUserId: "mock-user-1", plan: "monitor", status: "trial", anniversaryDay: 7 });
  await runScan({ businessId: business.id, kind: "free", db });
  await db.upsertChannel({ businessId: business.id, type: "facts_page", name: "Feitenpagina", externalId: null, url: `https://feiten.${business.domain ?? "bakkerijdevries.nl"}`, status: "pending" });
  await db.upsertChannel({ businessId: business.id, type: "gbp", name: "Google Bedrijfsprofiel", externalId: null, url: null, status: "pending" });
  await db.upsertChannel({ businessId: business.id, type: "bing", name: "Bing Places", externalId: null, url: null, status: "synced", lastSyncedAt: new Date().toISOString() });
}
