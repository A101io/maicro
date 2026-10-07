/**
 * The seam between apps/web and packages/core. Everything the web app needs
 * from core is imported here (and only here). Mock mode (MAICRO_MOCK=1 or no
 * DATABASE_URL) is handled by core itself: MemDb + deterministic mock engines.
 */
import { randomBytes } from "node:crypto";
import { db as moduleDb, MemDb, type Db } from "@maicro/core/db";
import { resolveBusiness as coreResolveBusiness, draftProvisionalFacts, prepareBusiness as corePrepareBusiness, runScan as coreRunScan, buildReport, SCAN_DEFAULTS, type BusinessCandidate, type ScanProgress } from "@maicro/core/scanner";
import { renderFactsPage } from "@maicro/core/publisher";
import { setBusinessStatus, setDb } from "@maicro/core/shared";
import { ENGINE_LABEL, type BusinessStatus, type Engine, type ScanKind, type ScanReport } from "@maicro/core/types";
import { copy } from "@maicro/core/copy";
import { env } from "./env";
import { seedDemo } from "./demo";

export type { BusinessCandidate, Db };
export { draftProvisionalFacts, buildReport, renderFactsPage, ENGINE_LABEL, SCAN_DEFAULTS };

/** prepareBusiness bound to the process-wide db. */
export function prepareBusiness(opts: Omit<Parameters<typeof corePrepareBusiness>[0], "db">) {
  return corePrepareBusiness({ ...opts, db });
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

type G = typeof globalThis & { __maicroDb?: Db; __maicroSeeded?: Promise<void>; __maicroProgress?: Map<string, ScanJobState> };
const g = globalThis as G;

/**
 * One Db for the whole process. `next dev` compiles every route into its own
 * module graph, so core's module-level `db` would be a different MemDb per
 * route; keeping the instance on globalThis (and telling this module graph's
 * core about it via setDb) makes mock mode consistent across routes.
 */
const db: Db = (() => {
  if (!g.__maicroDb) g.__maicroDb = env.mock ? new MemDb() : moduleDb;
  setDb(g.__maicroDb);
  return g.__maicroDb;
})();

export function getDb(): Db {
  if (env.mock && !g.__maicroSeeded) g.__maicroSeeded = seedDemo(db).catch((err) => console.warn("[web] demo seed failed", err));
  return db;
}

/** Awaits the mock demo seed (no-op outside mock mode). */
export async function ready(): Promise<Db> {
  const d = getDb();
  if (g.__maicroSeeded) await g.__maicroSeeded;
  return d;
}

/** Status transition with a `business.status` event (worker cron relies on it). */
export async function transitionStatus(businessId: string, status: BusinessStatus, extra: Record<string, unknown> = {}) {
  return setBusinessStatus(businessId, status, extra);
}

// ---------------------------------------------------------------------------
// Business resolution
// ---------------------------------------------------------------------------

/** "Bakkerij De Vries, Haarlem" / "Bakkerij De Vries in Haarlem" / "bakkerijdevries.nl" → query + optional place. */
export function parseQuery(raw: string): { query: string; place?: string } {
  const q = raw.trim().replace(/\s+/g, " ");
  const comma = q.match(/^(.+?)\s*,\s*([^,]+)$/);
  if (comma) return { query: comma[1]!.trim(), place: comma[2]!.trim() };
  const inMatch = q.match(/^(.+?)\s+(?:in|te)\s+([A-Za-zÀ-ÿ'’. -]{2,})$/);
  if (inMatch) return { query: inMatch[1]!.trim(), place: inMatch[2]!.trim() };
  return { query: q };
}

export async function resolveBusiness(query: string, place?: string): Promise<BusinessCandidate[]> {
  await ready();
  return coreResolveBusiness(query, place);
}

// ---------------------------------------------------------------------------
// Free scan with a token-keyed waiting room
// ---------------------------------------------------------------------------

export interface ScanProgressStep {
  key: string;
  label: string;
  done: boolean;
}

export interface ScanJobState {
  token: string;
  businessId: string;
  scanRunId: string | null;
  status: "queued" | "running" | "done" | "failed";
  steps: ScanProgressStep[];
  error?: string | null;
}

export const FREE_SCAN_ENGINES: Engine[] = SCAN_DEFAULTS.free.engines;

/** The ordered list of steps the waiting room shows; engines in scan order. */
export function progressTemplate(engines: Engine[]): ScanProgressStep[] {
  return [
    { key: "found", label: copy.scan.steps.found, done: false },
    ...engines.map((e) => ({ key: `ask:${e}`, label: copy.scan.steps.asking(ENGINE_LABEL[e]), done: false })),
    { key: "comparing", label: copy.scan.steps.comparing, done: false },
    { key: "sources", label: copy.scan.steps.sources, done: false },
    { key: "done", label: copy.scan.steps.done, done: false },
  ];
}

function progressMap() {
  g.__maicroProgress ??= new Map();
  return g.__maicroProgress;
}

export function newScanToken(businessId: string): string {
  return `${businessId}.${randomBytes(6).toString("hex")}`;
}

export function businessIdFromToken(token: string): string | null {
  const i = token.lastIndexOf(".");
  return i > 0 ? token.slice(0, i) : null;
}

async function persist(state: ScanJobState) {
  progressMap().set(state.token, state);
  try {
    await db.logEvent(state.businessId, "scan.progress", { token: state.token, scanRunId: state.scanRunId, status: state.status, steps: state.steps, error: state.error ?? null });
  } catch (err) {
    console.warn("[web] scan.progress event failed", err);
  }
}

/** Current waiting-room state: memory first, then the latest `scan.progress` event (other process). */
export async function getScanState(token: string): Promise<ScanJobState | null> {
  const mem = progressMap().get(token);
  if (mem) return mem;
  const businessId = businessIdFromToken(token);
  if (!businessId) return null;
  const events = await db.listEvents(businessId, 200);
  const ev = events.find((e) => e.type === "scan.progress" && e.payload.token === token);
  if (!ev) return null;
  const p = ev.payload as unknown as Omit<ScanJobState, "token" | "businessId">;
  return { token, businessId, scanRunId: p.scanRunId ?? null, status: p.status, steps: p.steps, error: p.error ?? null };
}

/** Create the waiting-room state (status queued). Call before `after(() => startFreeScan(...))`. */
export async function createScanState(businessId: string, engines: Engine[] = FREE_SCAN_ENGINES): Promise<ScanJobState> {
  const state: ScanJobState = { token: newScanToken(businessId), businessId, scanRunId: null, status: "queued", steps: progressTemplate(engines), error: null };
  await persist(state);
  return state;
}

/** Run the free scan through core and translate its progress events into waiting-room steps. */
export async function startFreeScan(state: ScanJobState, opts: { kind?: ScanKind; engines?: Engine[] } = {}): Promise<ScanReport | null> {
  const engines = opts.engines ?? FREE_SCAN_ENGINES;
  const kind = opts.kind ?? "free";
  const perEngine = new Map<Engine, number>();
  let perEngineTotal = Number.POSITIVE_INFINITY;
  const mark = (key: string) => {
    const s = state.steps.find((x) => x.key === key);
    if (s) s.done = true;
  };
  const markAllAsk = () => engines.forEach((e) => mark(`ask:${e}`));
  let dirty = false;
  let flushing: Promise<void> | null = null;
  const flush = () => {
    dirty = true;
    if (!flushing) {
      flushing = (async () => {
        while (dirty) {
          dirty = false;
          await persist(state);
        }
        flushing = null;
      })();
    }
  };

  state.status = "running";
  const onProgress = (ev: ScanProgress) => {
    if (ev.type === "start") {
      state.scanRunId = ev.scanRunId;
      perEngineTotal = engines.length ? Math.ceil(ev.total / engines.length) : ev.total;
      mark("found");
    } else if (ev.type === "asked") {
      const n = (perEngine.get(ev.engine) ?? 0) + 1;
      perEngine.set(ev.engine, n);
      if (n >= perEngineTotal) mark(`ask:${ev.engine}`);
    } else if (ev.type === "phase") {
      if (ev.phase === "extract" || ev.phase === "compare") {
        markAllAsk();
        if (ev.phase === "compare") mark("comparing");
      } else if (ev.phase === "attribute" || ev.phase === "persist") {
        markAllAsk();
        mark("comparing");
        if (ev.phase === "persist") mark("sources");
      } else if (ev.phase === "done") {
        state.steps.forEach((s) => (s.done = true));
      }
    }
    flush();
  };
  flush();
  try {
    const report = await coreRunScan({ businessId: state.businessId, kind, engines, onProgress, db });
    state.scanRunId = report.scanRunId;
    state.steps.forEach((s) => (s.done = true));
    state.status = "done";
    await persist(state);
    return report;
  } catch (err) {
    state.status = "failed";
    state.error = err instanceof Error ? err.message : String(err);
    await persist(state);
    return null;
  }
}

/** Load a finished scan as a ScanReport, or null when the run does not exist. */
export async function getScanReport(scanRunId: string): Promise<ScanReport | null> {
  await ready();
  try {
    return await buildReport(scanRunId, db);
  } catch {
    return null;
  }
}

/** Latest finished scan report of a business (used when /r/ is opened with a business slug or id). */
export async function latestScanReport(businessIdOrSlug: string): Promise<ScanReport | null> {
  const d = await ready();
  const business = await d.getBusiness(businessIdOrSlug);
  if (!business) return null;
  const runs = await d.listScanRuns(business.id, 20);
  const done = runs.find((r) => r.status === "done");
  return done ? getScanReport(done.id) : null;
}
