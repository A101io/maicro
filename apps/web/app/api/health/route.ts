import { getDb } from "@vidalo/core/shared";

/**
 * Health check for uptime monitoring (baseline D8): 200 when the database
 * answers, 503 when it does not. Says which backend it reached, never data.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const db = getDb();
    await db.getBusiness("00000000-0000-4000-8000-000000000000");
    return Response.json({ ok: true, db: db.kind, mock: process.env.VIDALO_MOCK === "1", ms: Date.now() - started });
  } catch {
    return Response.json({ ok: false, db: "unreachable", ms: Date.now() - started }, { status: 503 });
  }
}
