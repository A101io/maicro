import { NextResponse } from "next/server";
import { recordUnsubscribe, verifyUnsubscribeToken } from "@vidalo/core/shared";
import { ready } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * POST /api/afmelden?b=<business>&t=<token>
 * Two callers: the button on /afmelden (a form post, answered with a redirect)
 * and mail apps doing RFC 8058 one-click ("List-Unsubscribe=One-Click" body,
 * answered with 200). A GET never unsubscribes: link scanners open links.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const form = await req.formData().catch(() => null);
  const b = url.searchParams.get("b") ?? String(form?.get("b") ?? "");
  const t = url.searchParams.get("t") ?? String(form?.get("t") ?? "");
  const oneClick = form?.get("List-Unsubscribe") === "One-Click";
  if (!verifyUnsubscribeToken(b, t)) {
    return oneClick ? new NextResponse("invalid", { status: 400 }) : NextResponse.redirect(`${env.baseUrl}/afmelden?fout=1`, 303);
  }
  const db = await ready();
  if (!(await db.getBusiness(b))) return oneClick ? new NextResponse("ok") : NextResponse.redirect(`${env.baseUrl}/afmelden?klaar=1`, 303);
  await recordUnsubscribe(db, b, oneClick ? "one-click" : "link");
  return oneClick ? new NextResponse("ok") : NextResponse.redirect(`${env.baseUrl}/afmelden?klaar=1`, 303);
}
