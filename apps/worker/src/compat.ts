/**
 * Single place where the worker binds to core. Everything the worker needs
 * from the other packages is re-exported here, so the integration pass has one
 * file to touch when a signature moves.
 *
 * Fallbacks: when a core export is missing at runtime (another package still
 * in progress), a minimal local implementation is used and a warning logged.
 */
import * as dbModule from "@maicro/core/db";
import * as scannerModule from "@maicro/core/scanner";
import * as promptsModule from "@maicro/core/prompts";
import type { Db } from "@maicro/core/db";
import type { Facts, Prompt, ScanReport, Engine, ScanKind } from "@maicro/core/types";
import { log } from "./log.js";

type AnyModule = Record<string, unknown>;

export function getDb(): Db {
  const m = dbModule as unknown as AnyModule;
  if (m.db && typeof m.db === "object") return m.db as Db;
  if (typeof m.getDb === "function") return (m.getDb as () => Db)();
  return m as unknown as Db;
}

export interface RunScanOptions {
  businessId: string;
  kind: ScanKind;
  engines?: Engine[];
  samplesPerPrompt?: number;
  promptIds?: string[];
  db?: Db;
}

export async function runScan(opts: RunScanOptions): Promise<ScanReport> {
  const m = scannerModule as unknown as AnyModule;
  if (typeof m.runScan === "function") return (m.runScan as (o: RunScanOptions) => Promise<ScanReport>)(opts);
  // Fallback: an empty report so the pipeline keeps moving in isolation.
  log.warn("compat.runScan.fallback", { businessId: opts.businessId, kind: opts.kind });
  const db = getDb();
  const business = await db.getBusiness(opts.businessId);
  if (!business) throw new Error(`business ${opts.businessId} not found`);
  const run = await db.createScanRun({ businessId: business.id, kind: opts.kind, engines: opts.engines ?? [], samplesPerPrompt: opts.samplesPerPrompt ?? 0, status: "done" });
  return {
    business: { id: business.id, slug: business.slug, name: business.name, place: business.place },
    scanRunId: run.id,
    kind: opts.kind,
    checkedAt: new Date().toISOString(),
    totalAnswers: 0,
    wrongAnswers: 0,
    notFoundAnswers: 0,
    visibility: "found",
    engines: [],
    findings: [],
    correct: [],
  };
}

export type PromptTemplate = Omit<Prompt, "id" | "businessId">;

export function generatePrompts(facts: Facts): PromptTemplate[] {
  const m = promptsModule as unknown as AnyModule;
  if (typeof m.generatePrompts === "function") return (m.generatePrompts as (f: Facts) => PromptTemplate[])(facts);
  log.warn("compat.generatePrompts.fallback", { businessId: facts.businessId });
  const q = `${facts.name} in ${facts.place}`;
  return [
    { category: "existence", textNl: `Is ${q} nog open?`, probes: ["existence"], active: true },
    { category: "hours", textNl: `Wat zijn de openingstijden van ${q}?`, probes: ["hours"], active: true },
    { category: "phone", textNl: `Wat is het telefoonnummer van ${q}?`, probes: ["phone"], active: true },
    { category: "address", textNl: `Wat is het adres van ${q}?`, probes: ["address"], active: true },
    { category: "website", textNl: `Wat is de website van ${q}?`, probes: ["website"], active: true },
  ];
}
