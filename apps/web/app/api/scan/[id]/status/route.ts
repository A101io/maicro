import { NextResponse } from "next/server";
import { ready } from "@/lib/db";
import { getScanState } from "@/lib/core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/scan/[token]/status → { status, steps: [{key,label,done}], reportUrl? } */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await ready();
  const state = await getScanState(id);
  if (!state) return NextResponse.json({ status: "missing" }, { status: 404, headers: { "cache-control": "no-store" } });
  return NextResponse.json(
    { status: state.status, steps: state.steps, reportUrl: state.status === "done" && state.scanRunId ? `/r/${state.scanRunId}` : null, error: state.error ?? null },
    { headers: { "cache-control": "no-store" } },
  );
}
