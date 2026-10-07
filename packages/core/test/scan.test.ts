import { describe, expect, it } from "vitest";
import { withMockDb } from "../src/db";
import { ENGINES } from "../src/types";
import { generatePrompts } from "../src/prompts";
import { buildReport, runScan } from "../src/scanner";
import { createMockEngine } from "../src/scanner/engines";
import { prepareBusiness } from "../src/scanner/onboard";
import { resolveBusiness, draftProvisionalFacts } from "../src/scanner/resolve";
import { sampleFacts } from "./scanner-fixtures";

describe("mock engine", () => {
  it("is deterministic and injects wrong values for a share of prompts", async () => {
    const db = withMockDb();
    const business = await db.upsertBusiness({ name: "Bakkerij De Vries", place: "Haarlem" });
    const facts = sampleFacts({ businessId: business.id });
    const prompts = (await db.insertPrompts(business.id, generatePrompts(facts))).slice(0, 20);
    const engine = createMockEngine("chatgpt");
    const a = await engine.ask(prompts[0]!.textNl, { business, facts, prompt: prompts[0], sampleIndex: 0 });
    const b = await engine.ask(prompts[0]!.textNl, { business, facts, prompt: prompts[0], sampleIndex: 0 });
    expect(a).toEqual(b);
    expect(a.answerText).toMatch(/Bakkerij De Vries/);
  });
});

describe("runScan (mock pipeline)", () => {
  it("returns findings with sources and a correct list, and persists everything", async () => {
    const db = withMockDb();
    const prepared = await prepareBusiness({ name: "Bakkerij De Vries", place: "Haarlem", db });
    expect(prepared.prompts).toHaveLength(20);

    const report = await runScan({ businessId: prepared.business.id, kind: "baseline", samplesPerPrompt: 3, db });
    expect(report.totalAnswers).toBe(20 * 5 * 3);
    expect(report.wrongAnswers).toBeGreaterThan(0);
    expect(report.wrongAnswers).toBeLessThan(report.totalAnswers);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.correct.length).toBeGreaterThan(0);
    expect(report.engines).toHaveLength(5);
    expect(report.engines.every((e) => !e.skipped)).toBe(true);

    for (const f of report.findings) {
      expect(f.businessId).toBe(prepared.business.id);
      expect(f.scanRunId).toBe(report.scanRunId);
      expect(f.status).toBe("open");
      expect(f.frequency).toBeGreaterThan(0);
      expect(f.frequency).toBeLessThanOrEqual(f.sampleCount);
      expect(f.evidenceBefore).toBeTruthy();
      if (f.sourceUrl) expect(f.sourceType).not.toBe("none");
      else expect(["none", "other_entity"]).toContain(f.sourceType);
    }
    // The mock cites directories for part of the wrong answers.
    expect(report.findings.some((f) => f.sourceType === "directory_form")).toBe(true);
    expect(report.findings.some((f) => f.sourceType === "none")).toBe(true);

    const run = await db.getScanRun(report.scanRunId);
    expect(run?.status).toBe("done");
    expect(await db.listSamples(report.scanRunId)).toHaveLength(report.totalAnswers);
    expect((await db.listEvents(prepared.business.id)).map((e) => e.type)).toContain("scan.finished");

    // buildReport reconstructs the same numbers from storage.
    const rebuilt = await buildReport(report.scanRunId, db);
    expect(rebuilt.totalAnswers).toBe(report.totalAnswers);
    expect(rebuilt.wrongAnswers).toBe(report.wrongAnswers);
    expect(rebuilt.findings.map((f) => f.id).sort()).toEqual(report.findings.map((f) => f.id).sort());
  });

  it("free scan uses 6 prompts and the free-scan engines", async () => {
    const db = withMockDb();
    const prepared = await prepareBusiness({ name: "Kapsalon Mooi", place: "Leiden", db });
    const report = await runScan({ businessId: prepared.business.id, kind: "free", db });
    expect(report.engines.map((e) => e.engine)).toEqual(["chatgpt", "google_ai", "copilot"]);
    expect(report.totalAnswers).toBe(6 * 3 * 3);
  });

  it("upserts findings across scans and resolves the ones that are no longer wrong", async () => {
    const db = withMockDb();
    const prepared = await prepareBusiness({ name: "Bakkerij De Vries", place: "Haarlem", db });
    const first = await runScan({ businessId: prepared.business.id, kind: "baseline", samplesPerPrompt: 2, db });
    expect(first.findings.length).toBeGreaterThan(0);

    // Same inputs again: the same findings are updated in place, not duplicated.
    const second = await runScan({ businessId: prepared.business.id, kind: "monthly", samplesPerPrompt: 2, db });
    const ids = new Set(first.findings.map((f) => f.id));
    expect(second.findings.every((f) => ids.has(f.id))).toBe(true);
    expect(await db.listFindings(prepared.business.id, "open")).toHaveLength(first.findings.length);

    // A recheck where every engine now answers correctly resolves all open findings with after-evidence.
    const perfect = ENGINES.map((e) => createMockEngine(e, { wrongPairRate: 0, otherEntityRate: 0 }));
    const third = await runScan({ businessId: prepared.business.id, kind: "recheck", samplesPerPrompt: 2, db, clients: perfect });
    expect(third.findings).toHaveLength(0);
    expect(third.wrongAnswers).toBe(0);
    expect(await db.listFindings(prepared.business.id, "open")).toHaveLength(0);
    const resolved = await db.listFindings(prepared.business.id, "resolved");
    expect(resolved).toHaveLength(first.findings.length);
    expect(resolved.every((f) => f.resolvedAt && f.evidenceAfter)).toBe(true);
  });
});

describe("resolve (mock)", () => {
  it("returns a synthetic candidate and drafts provisional facts", async () => {
    const [c] = await resolveBusiness("Garage Jansen", "Zwolle");
    expect(c).toMatchObject({ name: "Garage Jansen", place: "Zwolle", source: "mock" });
    expect(c!.phone).toMatch(/^\+31/);
    const facts = await draftProvisionalFacts(c!);
    expect(facts.provisional).toBe(true);
    expect(facts.verifiedAt).toBeNull();
    expect(facts.hours).toHaveLength(7);
    expect(facts.servicesYes).toContain("apk-keuring");
  });
});
