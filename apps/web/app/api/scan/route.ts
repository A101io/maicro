import { cloudflareBindings } from "@/lib/cloudflare";
import { NextResponse, after } from "next/server";
import { copyFor } from "@maicro/core/copy";
import { localizeHref } from "@/lib/lang-paths";
import { langFromReferer } from "@/lib/request-lang";
import { env } from "@/lib/env";
import { ready } from "@/lib/db";
import { resolveBusiness, prepareBusiness, parseQuery, createScanState, startFreeScan, FREE_SCAN_ENGINES, progressTemplate, type BusinessCandidate } from "@/lib/core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

async function readInput(req: Request): Promise<{ q: string; pick: number | null; place: string | null }> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = (await req.json()) as { q?: string; pick?: number; place?: string };
    return { q: String(body.q ?? "").trim(), pick: typeof body.pick === "number" ? body.pick : null, place: body.place?.trim() || null };
  }
  const form = await req.formData();
  const pick = form.get("pick");
  const place = String(form.get("place") ?? "").trim();
  return { q: String(form.get("q") ?? "").trim(), pick: pick != null && pick !== "" ? Number(pick) : null, place: place || null };
}

/**
 * POST /api/scan  (q=<name or website>[, place=<plaats>][, pick=<candidate index>])
 * Resolves the business; with several candidates (or none / no place) redirects to
 * /scan/kies; otherwise prepares business + provisional facts + prompts, starts the
 * free scan after the response and redirects to the waiting room /scan/[token].
 */
export async function POST(req: Request) {
  const { q, pick, place: placeInput } = await readInput(req);
  const lang = langFromReferer(req);
  const copy = copyFor(lang);
  // Redirects land on pages in the language the form was posted from.
  const base = env.baseUrl;
  const to = (path: string) => `${base}${localizeHref(path, lang)}`;
  if (!q) return NextResponse.redirect(to("/?fout=leeg#controle"), 303);
  await ready();

  const parsed = parseQuery(q);
  const place = placeInput ?? parsed.place;
  const candidates = await resolveBusiness(parsed.query, place);
  const kies = to(`/scan/kies?q=${encodeURIComponent(q)}${place ? `&place=${encodeURIComponent(place)}` : ""}`);
  if (candidates.length === 0) return NextResponse.redirect(kies, 303);

  let candidate: BusinessCandidate | undefined;
  if (candidates.length === 1) candidate = candidates[0];
  else if (pick != null && candidates[pick]) candidate = candidates[pick];
  if (!candidate) return NextResponse.redirect(kies, 303);
  const finalPlace = candidate.place ?? place;
  if (!finalPlace) return NextResponse.redirect(`${kies}&plaats=1`, 303);

  const db = await ready();
  const dayAgo = new Date(Date.now() - DAY_MS);
  if (env.realEngines && (await db.countEventsSince("scan.requested", dayAgo)) >= env.freeScansPerDay) {
    await db.logEvent(null, "scan.refused", { reason: "daily_cap", cap: env.freeScansPerDay });
    return NextResponse.redirect(to("/scan/druk"), 303);
  }

  const { business, created } = await prepareBusiness({ name: candidate.name, place: finalPlace, candidate });

  // Asked again within a day: show the report we already paid for.
  const recent = (await db.listScanRuns(business.id, 5)).find((r) => r.kind === "free" && r.status === "done" && r.finishedAt && new Date(r.finishedAt) >= dayAgo);
  if (recent) {
    await db.logEvent(business.id, "scan.reused", { scanRunId: recent.id, via: "web" });
    return NextResponse.redirect(to(`/r/${recent.id}`), 303);
  }

  await db.logEvent(business.id, "scan.requested", { q, created, via: "web" });

  const state = await createScanState(business.id, copy, FREE_SCAN_ENGINES);
  // On Cloudflare a scan outlives a request (several minutes with live
  // engines; waitUntil allows 30 s), so it goes on the queue and the
  // background worker runs it. Elsewhere (local, mock) it runs right after
  // the response. Either way the waiting room polls /api/scan/[token]/status.
  const queue = cloudflareBindings()?.SCAN_QUEUE;
  if (queue) {
    await queue.send({ token: state.token, kind: "free", engines: FREE_SCAN_ENGINES });
  } else {
    after(async () => {
      await startFreeScan(state, { kind: "free", engines: FREE_SCAN_ENGINES });
    });
  }

  return NextResponse.redirect(to(`/scan/${state.token}`), 303);
}

export async function GET(req: Request) {
  const copy = copyFor(langFromReferer(req));
  return NextResponse.json({ ok: true, steps: progressTemplate(FREE_SCAN_ENGINES, copy).map((s) => s.label), note: copy.scan.waiting });
}
