/**
 * Vidalo worker: job loop + cron tick + facts-page HTTP server in one process.
 *
 *   VIDALO_MOCK=1 pnpm --filter @vidalo/worker start
 *
 * Env: DATABASE_URL (or VIDALO_MOCK=1), FACTS_PORT (8787), WORKER_POLL_MS (2000),
 * CRON_EVERY_MS (600000), WORKER_ONCE=1 (drain the queue, tick once, exit),
 * WORKER_NO_HTTP=1, WORKER_NO_CRON=1, WORKER_SEED=1 (mock demo business + setup job), VIDALO_OUT_DIR (out/).
 */
import { getDb } from "./compat.js";
import { cronTick } from "./cron.js";
import { startHttp } from "./http.js";
import { drainQueue, stopDraining } from "./loop.js";
import { errorMessage, log } from "./log.js";

export { drainQueue, processJob } from "./loop.js";

/** The Node loops run until a signal; drainQueue has its own flag (loop.ts). */
let stopping = false;
import { seedDemo } from "./seed.js";

const POLL_MS = Number(process.env.WORKER_POLL_MS ?? 2000);
const CRON_MS = Number(process.env.CRON_EVERY_MS ?? 10 * 60 * 1000);

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
  log.info("worker.start", { mock: process.env.VIDALO_MOCK === "1", db: db.kind, pollMs: POLL_MS, cronMs: CRON_MS });
  if (process.env.WORKER_SEED === "1") await seedDemo();

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
    stopDraining();
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
