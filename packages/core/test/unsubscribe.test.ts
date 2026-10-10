import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { MemDb } from "../src/db";
import { setDb, unsubscribeToken, verifyUnsubscribeToken, recordUnsubscribe, isUnsubscribed } from "../src/shared";
import { sendFollowUp } from "../src/reporter";

describe("unsubscribe tokens", () => {
  it("verify for their own business only", () => {
    const t = unsubscribeToken("b-1");
    expect(verifyUnsubscribeToken("b-1", t)).toBe(true);
    expect(verifyUnsubscribeToken("b-2", t)).toBe(false);
    expect(verifyUnsubscribeToken("b-1", t.slice(0, -1) + (t.endsWith("A") ? "B" : "A"))).toBe(false);
    expect(verifyUnsubscribeToken("b-1", "")).toBe(false);
  });
});

describe("follow-up mails respect the opt-out", () => {
  let db: MemDb;
  beforeEach(async () => {
    db = new MemDb();
    setDb(db);
    process.env.MAICRO_OUT_DIR = await mkdtemp(path.join(tmpdir(), "maicro-unsub-"));
  });

  async function scannedBusiness() {
    const b = await db.upsertBusiness({ name: "Bakkerij De Vries", place: "Haarlem", status: "scanned", ownerEmail: "eigenaar@example.nl" });
    const run = await db.createScanRun({ businessId: b.id, kind: "free", engines: ["chatgpt"], samplesPerPrompt: 3 });
    await db.upsertFindings([{ businessId: b.id, scanRunId: run.id, factKey: "phone", subject: null, engine: "chatgpt", wrongValue: "023-1111111", correctValue: "023-2222222", frequency: 2, sampleCount: 3, sourceUrl: null, sourceType: "none", evidenceBefore: null }]);
    return b;
  }

  it("carries the opt-out link and the one-click headers", async () => {
    const b = await scannedBusiness();
    const res = await sendFollowUp(b.id, 7);
    expect(res?.file).toBeTruthy();
    const eml = await readFile(res!.file!, "utf8");
    expect(eml).toContain(`/afmelden?b=${b.id}&t=${unsubscribeToken(b.id)}`);
    expect(eml).toMatch(/List-Unsubscribe: <.*\/api\/afmelden\?b=/);
    expect(eml).toContain("List-Unsubscribe-Post: List-Unsubscribe=One-Click");
  });

  it("sends nothing once the owner has opted out", async () => {
    const b = await scannedBusiness();
    await recordUnsubscribe(db, b.id, "link");
    await recordUnsubscribe(db, b.id, "one-click"); // idempotent
    expect(await isUnsubscribed(db, b.id)).toBe(true);
    expect((await db.listEvents(b.id)).filter((e) => e.type === "email.unsubscribed")).toHaveLength(1);
    expect(await sendFollowUp(b.id, 7)).toBeNull();
    expect(await sendFollowUp(b.id, 21)).toBeNull();
  });
});
