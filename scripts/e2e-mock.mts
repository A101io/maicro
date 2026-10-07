/**
 * End-to-end in one process, fully offline (MAICRO_MOCK=1):
 *   prepareBusiness → free scan → "checkout" (status trial + setup job) →
 *   drain the job queue with the worker's dispatcher → assert facts page,
 *   fixes, welcome + baseline mails.
 *
 *   pnpm e2e:mock
 */
import { mkdtemp, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

process.env.MAICRO_MOCK = "1";
process.env.MAICRO_OUT_DIR ??= await mkdtemp(path.join(tmpdir(), "maicro-e2e-"));
process.env.PUBLIC_BASE_URL ??= "http://localhost:3000";

const { db } = await import("@maicro/core/db");
const { prepareBusiness, runScan } = await import("@maicro/core/scanner");
const { setBusinessStatus } = await import("@maicro/core/shared");
const { handlerFor, validatePayload, JOB_KINDS } = await import("@maicro/worker/src/jobs/index.ts");
const { copy } = await import("@maicro/core/copy");

const out = process.env.MAICRO_OUT_DIR!;
const step = (s: string) => console.log(`\n== ${s}`);

// 1. Acquisition: business + provisional facts + prompts, then the free scan (what /api/scan does).
step("prepareBusiness + free scan");
const { business, created } = await prepareBusiness({ name: "Bakkerij De Vries", place: "Haarlem", db });
assert.ok(created, "business created");
const free = await runScan({ businessId: business.id, kind: "free", db });
console.log(`free scan ${free.scanRunId}: ${free.wrongAnswers}/${free.totalAnswers} wrong`);
assert.ok(free.totalAnswers > 0 && free.wrongAnswers > 0, "free scan produced findings");

// 2. Result page e-mail capture + checkout (what /api/report-email, /api/checkout and the Stripe webhook do).
step("email capture + checkout");
await db.upsertBusiness({ id: business.id, slug: business.slug, name: business.name, place: business.place, ownerEmail: "eigenaar@bakkerijdevries.nl", plan: "monitor" });
await db.enqueueJob("email", { template: "baseline", scanRunId: free.scanRunId, businessId: business.id });
await setBusinessStatus(business.id, "trial", { via: "e2e" });
await db.enqueueJob("setup", { businessId: business.id });
const statusEvent = (await db.listEvents(business.id, 50)).find((e) => e.type === "business.status");
assert.equal(statusEvent?.payload.status, "trial", "business.status event logged");

// 3. Owner confirms facts (what /app/gegevens does) → publish + sync.
step("facts confirmed → publish + sync");
const provisional = await db.latestFacts(business.id);
assert.ok(provisional, "provisional facts exist");
const { businessId: _b, version: _v, provisional: _p, verifiedAt: _va, ...data } = provisional!;
const confirmed = await db.insertFacts(business.id, data, { provisional: false, verifiedAt: new Date().toISOString() });
await db.enqueueJob("publish", { businessId: business.id, reason: `facts v${confirmed.version} confirmed` });
await db.enqueueJob("sync", { businessId: business.id });
await db.enqueueJob("scan", { businessId: business.id, kind: "ondemand", then: ["fixes"] });

// 4. Drain the queue with the worker's dispatcher (same code path as apps/worker processJob, without the loop).
step("drain job queue");
let processed = 0;
const seen: string[] = [];
for (let i = 0; i < 200; i++) {
  const job = await db.claimJob();
  if (!job) break;
  const handler = handlerFor(job.kind);
  assert.ok(handler, `handler for ${job.kind}`);
  const invalid = JOB_KINDS.includes(job.kind as never) ? validatePayload(job.kind as never, job.payload) : null;
  assert.equal(invalid, null, `payload valid for ${job.kind}`);
  try {
    const result = await handler!(job.payload, job);
    await db.completeJob(job.id);
    seen.push(job.kind);
    console.log(`job ${job.id} ${job.kind}`, result ? JSON.stringify(result).slice(0, 160) : "");
  } catch (err) {
    await db.failJob(job.id, String((err as Error).message ?? err));
    throw err;
  }
  processed++;
}
console.log(`processed ${processed} jobs: ${seen.join(", ")}`);
for (const k of ["email", "setup", "publish", "sync", "scan", "fixes"]) assert.ok(seen.includes(k), `ran ${k} job`);

// 5. Assertions.
step("assertions");
const b = await db.getBusiness(business.id);
assert.ok(b?.factsHost, "facts host set");
const channels = await db.listChannels(business.id);
const factsChannel = channels.find((c) => c.type === "facts_page");
assert.ok(factsChannel, "facts_page channel exists");
const pages = await readdir(path.join(out, "pages")).catch(() => [] as string[]);
assert.ok(pages.length > 0, "facts page written to out/pages");
const pageDir = path.join(out, "pages", pages[0]!);
const html = await readFile(path.join(pageDir, "index.html"), "utf8").catch(() => "");
assert.ok(html.includes(business.name), "rendered facts page contains the business name");

const findings = await db.listFindings(business.id);
assert.ok(findings.length > 0, "findings persisted");
let fixes = 0;
for (const f of findings) fixes += (await db.listFixes(f.id)).length;
assert.ok(fixes > 0, "fixes opened for findings");

const mails = await readdir(path.join(out, "mail"));
const bodies = await Promise.all(mails.map((m) => readFile(path.join(out, "mail", m), "utf8")));
const has = (needle: string) => bodies.some((x) => x.includes(needle));
assert.ok(has(copy.email.subjects.welcome) || has("Welkom"), "welcome mail written");
assert.ok(has("antwoorden") || has("antwoord"), "baseline summary mail written");
console.log(`mails: ${mails.length} in ${path.join(out, "mail")}`);
console.log(`facts page: ${pageDir}`);
console.log(`findings: ${findings.length}, fixes: ${fixes}, channels: ${channels.length}`);

await db.close();
console.log("\nOK e2e-mock");
