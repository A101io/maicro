import { getDb, runScan } from "../compat.js";
import { log } from "../log.js";
import type { Handler } from "./types.js";

/**
 * Run a scan. Afterwards:
 *   baseline → fixes + baseline summary mail
 *   monthly  → fixes + monthly report
 *   free / ondemand / recheck → nothing (recheck logic lives in the fixer)
 */
export const scan: Handler<"scan"> = async (p) => {
  const db = getDb();
  const report = await runScan({ businessId: p.businessId, kind: p.kind, engines: p.engines, samplesPerPrompt: p.samplesPerPrompt, promptIds: p.promptIds, db });
  log.info("scan.done", { businessId: p.businessId, kind: p.kind, scanRunId: report.scanRunId, total: report.totalAnswers, wrong: report.wrongAnswers });

  const then = p.then ?? (p.kind === "baseline" ? ["fixes", "baseline_summary"] : p.kind === "monthly" ? ["fixes", "report"] : []);
  for (const step of then) {
    if (step === "fixes") await db.enqueueJob("fixes", { scanRunId: report.scanRunId, businessId: p.businessId });
    if (step === "baseline_summary") await db.enqueueJob("email", { template: "baseline", scanRunId: report.scanRunId, businessId: p.businessId });
    if (step === "report") {
      // Report after the fix round has had a moment to open fixes (so "wat we doen" is filled).
      await db.enqueueJob("report", { businessId: p.businessId, scanRunId: report.scanRunId }, new Date(Date.now() + 5 * 60 * 1000));
    }
  }
  await db.logEvent(p.businessId, "scan.done", { kind: p.kind, scanRunId: report.scanRunId, total: report.totalAnswers, wrong: report.wrongAnswers, then });
  return { scanRunId: report.scanRunId, wrong: report.wrongAnswers, total: report.totalAnswers };
};
