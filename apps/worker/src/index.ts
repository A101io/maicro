/**
 * Vidalo worker: job loop + cron tick + facts-page HTTP server in one process.
 *
 *   MAICRO_MOCK=1 pnpm --filter @maicro/worker start
 *
 * Env: DATABASE_URL (or MAICRO_MOCK=1), FACTS_PORT (8787), WORKER_POLL_MS (2000),
 * CRON_EVERY_MS (600000), WORKER_ONCE=1 (drain the queue, tick once, exit),
 * WORKER_NO_HTTP=1, WORKER_NO_CRON=1, WORKER_SEED=1 (mock demo business + setup job), WORKER_OWN=0 (skip Vidalo as its own customer), MAICRO_OUT_DIR (out/).
 */
import type { Job } from "@maicro/core/db";
import { getDb } from "./compat.js";
import { cronTick } from "./cron.js";
import { startHttp } from "./http.js";
import { handlerFor, validatePayload, JOB_KINDS, type JobKind } from "./jobs/index.js";
import { errorMessage, log } from "./log.js";
import { ensureOwnBusiness, seedDemo } from "./seed.js";

const POLL_MS = Number(process.env.WORKER_POLL_MS ?? 2000);
const CRON_MS = Number(process.env.CRON_EVERY_MS ?? 10 * 60 * 1000);
const JOB_TIMEOUT_MS = Number(process.env.JOB_TIMEOUT_MS ?? 20 * 60 * 1000);

let stopping = false;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

/** Run one job: dispatch by kind, complete or fail with backoff. Returns true when a job was processed. */
export async function processJob(job: Job): Promise<boolean> {
  const db = getDb();
  const started = Date.now();
  const handler = handlerFor(job.kind);
  const base = { jobId: job.id, kind: job.kind, attempt: job.attempts, businessId: job.payload.businessId ?? null };
  if (!handler) {
    log.error("job.unknown_kind", base);
    await db.failJob(job.id, `unknown job kind ${job.kind}`);
    return true;
  }
  const invalid = JOB_KINDS.includes(job.kind as JobKind) ? validatePayload(job.kind as JobKind, job.payload) : null;
  if (invalid) {
    log.error("job.invalid_payload", { ...base, error: invalid });
    await db.failJob(job.id, invalid);
    return true;
  }
  log.info("job.start", base);
  try {
    const result = await withTimeout(handler(job.payload, job), JOB_TIMEOUT_MS, `job ${job.id} (${job.kind})`);
    await db.completeJob(job.id);
    log.info("job.done", { ...base, ms: Date.now() - started, result: result ?? null });
  } catch (err) {
    const error = errorMessage(err);
    const failed = await db.failJob(job.id, error);
    const exhausted = failed.doneAt !== null;
    log.error("job.failed", { ...base, ms: Date.now() - started, error, exhausted, nextRunAt: exhausted ? null : failed.runAt });
    if (exhausted) {
      await db.logEvent((job.payload.businessId as string | undefined) ?? null, "job.exhausted", { jobId: job.id, kind: job.kind, error });
    }
  }
  return true;
}

/** Claim and run jobs until the queue is empty. */
export async function drainQueue(max = Number.POSITIVE_INFINITY): Promise<number> {
  const db = getDb();
  let n = 0;
  while (!stopping && n < max) {
    const job = await db.claimJob();
    if (!job) break;
    await processJob(job);
    n++;
  }
  return n;
}

async function jobLoop(): Promise<void> {
  while (!stopping) {
    try {
      const n = await drainQueue();
      if (n === 0) await sleep(POLL_MS);
    } catch (err) {
      log.error("loop.error", { error: errorMessage(err) });
      await sleep(POLL_MS * 2);
    }
  }
}

async function cronLoop(): Promise<void> {
  while (!stopping) {
    try {
      await cronTick();
    } catch (err) {
      log.error("cron.error", { error: errorMessage(err) });
    }
    await sleep(CRON_MS);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function main(): Promise<void> {
  const db = getDb();
  log.info("worker.start", { mock: process.env.MAICRO_MOCK === "1", db: db.kind, pollMs: POLL_MS, cronMs: CRON_MS });
  if (process.env.WORKER_SEED === "1") await seedDemo();
  if (process.env.WORKER_OWN !== "0") await ensureOwnBusiness();

  if (process.env.WORKER_ONCE === "1") {
    // drain → tick → drain, so a seeded setup job gets its host poll / rechecks in the same run
    const n1 = await drainQueue();
    await cronTick();
    const n2 = await drainQueue();
    log.info("worker.once.done", { jobs: n1 + n2 });
    await db.close();
    return;
  }

  const server = process.env.WORKER_NO_HTTP === "1" ? null : startHttp();
  const loops = [jobLoop()];
  if (process.env.WORKER_NO_CRON !== "1") loops.push(cronLoop());

  const shutdown = async (signal: string) => {
    if (stopping) return;
    stopping = true;
    log.info("worker.stopping", { signal });
    server?.close();
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await Promise.all(loops);
  await db.close();
  log.info("worker.stopped");
}

const isEntry = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^.*\//, ""));
if (isEntry) {
  main().catch((err) => {
    log.error("worker.fatal", { error: errorMessage(err) });
    process.exit(1);
  });
}
