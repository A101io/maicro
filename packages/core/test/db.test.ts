import { describe, expect, it } from "vitest";
import { withMockDb, isMockMode } from "../src/db";
import { sampleFacts } from "./scanner-fixtures";

describe("MemDb round trip", () => {
  it("is selected in mock mode", () => {
    expect(isMockMode()).toBe(true);
  });

  it("stores business, facts, prompts, scan runs, samples, claims and findings", async () => {
    const db = withMockDb();
    const b = await db.upsertBusiness({ name: "Bakkerij De Vries", place: "Haarlem", domain: "bakkerijdevries.nl" });
    expect(b.slug).toBe("bakkerij-de-vries-haarlem");
    expect(await db.getBusiness(b.slug)).toMatchObject({ id: b.id, domain: "bakkerijdevries.nl" });
    // Upsert by slug merges partial updates.
    const b2 = await db.upsertBusiness({ name: "Bakkerij De Vries", place: "Haarlem", status: "trial", anniversaryDay: 12 });
    expect(b2.id).toBe(b.id);
    expect(b2.domain).toBe("bakkerijdevries.nl");
    expect(b2.status).toBe("trial");

    const f1 = await db.insertFacts(b.id, sampleFacts(), { provisional: true });
    const f2 = await db.insertFacts(b.id, { ...sampleFacts(), phone: "023-5300000" }, { provisional: false, verifiedAt: new Date().toISOString() });
    expect(f1.version).toBe(1);
    expect(f2.version).toBe(2);
    expect((await db.latestFacts(b.id))?.phone).toBe("023-5300000");

    const prompts = await db.insertPrompts(b.id, [{ category: "phone", textNl: "Wat is het telefoonnummer?", probes: ["phone"], active: true }]);
    expect(await db.listPrompts(b.id)).toHaveLength(1);

    const run = await db.createScanRun({ businessId: b.id, kind: "free", engines: ["chatgpt"], samplesPerPrompt: 3, status: "running" });
    const [s] = await db.insertSamples([{ scanRunId: run.id, promptId: prompts[0]!.id, engine: "chatgpt", answerText: "023-5399999", citations: ["https://openingstijden.nl/x"], costCents: 1 }]);
    await db.insertClaims([{ sampleId: s!.id, factKey: "phone", subject: null, value: "+31235399999", confidence: 0.9, otherEntity: false, rawQuote: "023-5399999" }]);
    expect(await db.listSamples(run.id)).toHaveLength(1);
    expect(await db.listClaims([s!.id])).toHaveLength(1);

    const [finding] = await db.upsertFindings([
      { businessId: b.id, scanRunId: run.id, factKey: "phone", subject: null, engine: "chatgpt", wrongValue: "+31235399999", correctValue: "+31235300000", frequency: 1, sampleCount: 3, sourceUrl: "https://openingstijden.nl/x", sourceType: "directory_form", evidenceBefore: s!.id },
    ]);
    expect(finding!.status).toBe("open");
    // Second upsert with the same key updates frequency instead of inserting.
    const [again] = await db.upsertFindings([{ ...finding!, frequency: 2, sourceUrl: null, sourceType: "none" }]);
    expect(again!.id).toBe(finding!.id);
    expect(again!.frequency).toBe(2);
    expect(again!.sourceUrl).toBe("https://openingstijden.nl/x"); // kept
    expect(await db.listFindings(b.id, "open")).toHaveLength(1);

    const resolved = await db.markFindingResolved(finding!.id, s!.id);
    expect(resolved.status).toBe("resolved");
    expect(resolved.evidenceAfter).toBe(s!.id);
    expect(await db.listFindings(b.id, "open")).toHaveLength(0);

    const updated = await db.updateScanRun(run.id, { status: "done", costCents: 12, finishedAt: new Date().toISOString() });
    expect(updated.costCents).toBe(12);
    expect(await db.businessesDueForMonthlyScan(12)).toHaveLength(1);
    expect(await db.businessesDueForMonthlyScan(13)).toHaveLength(0);
  });

  it("job queue: claim, complete, fail with backoff", async () => {
    const db = withMockDb();
    await db.enqueueJob("scan", { businessId: "x" });
    const later = await db.enqueueJob("report", {}, new Date(Date.now() + 60_000));
    const job = await db.claimJob();
    expect(job?.kind).toBe("scan");
    expect(job?.lockedAt).not.toBeNull();
    expect(await db.claimJob()).toBeNull(); // locked; the other one is not due yet
    const failed = await db.failJob(job!.id, "boom");
    expect(failed.lockedAt).toBeNull();
    expect(new Date(failed.runAt).getTime()).toBeGreaterThan(Date.now());
    expect(failed.doneAt).toBeNull();
    await db.completeJob(later.id);
    expect(await db.claimJob(["report"])).toBeNull();
  });

  it("fixes, channels and events", async () => {
    const db = withMockDb();
    const b = await db.upsertBusiness({ name: "X", place: "Y" });
    const ch = await db.upsertChannel({ businessId: b.id, type: "gbp", name: "Google Bedrijfsprofiel", externalId: null, url: null });
    const ch2 = await db.upsertChannel({ businessId: b.id, type: "gbp", name: "Google Bedrijfsprofiel", externalId: "abc", url: null, status: "synced" });
    expect(ch2.id).toBe(ch.id);
    expect((await db.listChannels(b.id))[0]).toMatchObject({ externalId: "abc", status: "synced" });

    const fix = await db.insertFix({ findingId: "f", action: "email", target: "info@x.nl", recheckAt: new Date(Date.now() - 1000).toISOString() });
    expect(await db.listDueRechecks()).toHaveLength(1);
    await db.updateFix(fix.id, { resolvedAt: new Date().toISOString() });
    expect(await db.listDueRechecks()).toHaveLength(0);

    await db.logEvent(b.id, "test", { a: 1 });
    expect((await db.listEvents(b.id))[0]?.type).toBe("test");
  });
});

describe("MemDb sector layer", () => {
  it("keeps sector, prompt kind/criterium and separates recommendation findings from about findings", async () => {
    const db = withMockDb();
    const b = await db.upsertBusiness({ name: "Loodgieter Bos", place: "Zwolle", sector: "loodgieters-installateurs" });
    expect((await db.getBusiness(b.id))?.sector).toBe("loodgieters-installateurs");
    const [p] = await db.insertPrompts(b.id, [{ category: "service", textNl: "Wie installeert warmtepompen in Zwolle?", probes: ["service:warmtepompen"], active: true, kind: "recommendation", criterium: 6 }]);
    expect(p).toMatchObject({ kind: "recommendation", criterium: 6 });
    const run = await db.createScanRun({ businessId: b.id, kind: "baseline", engines: ["chatgpt"], samplesPerPrompt: 3 });
    const base = { businessId: b.id, scanRunId: run.id, factKey: "service" as const, subject: "warmtepompen", engine: "chatgpt" as const, correctValue: "yes", frequency: 2, sampleCount: 3, sourceUrl: null, sourceType: "none" as const, evidenceBefore: null };
    const [about] = await db.upsertFindings([{ ...base, wrongValue: "no", criterium: 6 }]);
    const [rec] = await db.upsertFindings([{ ...base, wrongValue: "niet genoemd", evidenceKind: "recommendation", criterium: 6 }]);
    expect(rec!.id).not.toBe(about!.id);
    expect(about!.evidenceKind).toBe("about");
    expect(rec!.evidenceKind).toBe("recommendation");
    expect(rec!.criterium).toBe(6);
    const [again] = await db.upsertFindings([{ ...base, wrongValue: "niet genoemd", evidenceKind: "recommendation", frequency: 3 }]);
    expect(again!.id).toBe(rec!.id);
    expect(again!.frequency).toBe(3);
    expect(again!.criterium).toBe(6);
    expect(await db.listFindings(b.id, "open")).toHaveLength(2);
  });
});
