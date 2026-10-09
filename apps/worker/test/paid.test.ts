import { beforeEach, describe, expect, it } from "vitest";
import { MemDb } from "@maicro/core/db";
import { setDb } from "@maicro/core/shared";
import { handlerFor } from "../src/jobs/index";
import type { Job } from "@maicro/core/db";

// A business nobody has paid for must never get anything published or sent in
// its name, whoever claimed it. Status alone decides.
describe("paid-only jobs", () => {
  let db: MemDb;
  beforeEach(() => {
    db = new MemDb();
    setDb(db);
  });

  const job = (kind: string, payload: Record<string, unknown>) => ({ id: 1, kind, payload }) as unknown as Job;

  async function business(status: "scanned" | "trial" | "active" | "paused" | "churned") {
    const b = await db.upsertBusiness({ name: "Bakkerij De Vries", place: "Haarlem", status });
    const run = await db.createScanRun({ businessId: b.id, kind: "free", engines: ["chatgpt"], samplesPerPrompt: 1 });
    const [finding] = await db.upsertFindings([{ businessId: b.id, scanRunId: run.id, factKey: "phone", subject: null, engine: "chatgpt", wrongValue: "1", correctValue: "2", frequency: 1, sampleCount: 1, sourceUrl: null, sourceType: "none", evidenceBefore: null }]);
    const fix = await db.insertFix({ findingId: finding!.id, action: "republish", target: "facts_page" });
    return { b, run, fix };
  }

  it("fails closed when the business cannot be found", async () => {
    expect(await handlerFor("publish")!({ businessId: "nope" }, job("publish", { businessId: "nope" }))).toEqual({ skipped: "no_business" });
  });

  for (const status of ["scanned", "paused", "churned"] as const) {
    it(`skips publish, sync, setup, fixes and recheck for a ${status} business`, async () => {
      const { b, run, fix } = await business(status);
      const cases: [string, Record<string, unknown>][] = [
        ["publish", { businessId: b.id }],
        ["sync", { businessId: b.id }],
        ["setup", { businessId: b.id }],
        ["fixes", { scanRunId: run.id }],
        ["recheck", { fixId: fix.id }],
      ];
      for (const [kind, payload] of cases) {
        const out = await handlerFor(kind)!(payload, job(kind, payload));
        expect(out, kind).toEqual({ skipped: `not_paying:${status}` });
      }
      const skipped = (await db.listEvents(b.id, 50)).filter((e) => e.type === "job.skipped");
      expect(skipped).toHaveLength(cases.length);
    });
  }

  it("runs them for a paying business", async () => {
    const { b } = await business("trial");
    // Past the guard, the real publish step runs and wants facts this fixture never gave it.
    await expect(handlerFor("publish")!({ businessId: b.id }, job("publish", { businessId: b.id }))).rejects.toThrow(/has no facts yet/);
  });
});
