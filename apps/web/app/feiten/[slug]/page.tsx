import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/lib/i18n";
import { ready } from "@/lib/db";
import { factsPageBody } from "@/lib/factsPage";
import { getSession, getOwnedBusiness } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false } };

/**
 * Owner preview of the facts page: the same HTML the publisher serves on
 * feiten.{domain}, wrapped in a thin preview bar.
 *
 * Only the signed-in owner sees it. It renders whatever facts were last saved,
 * confirmed or not, and it is served from Maicro's own domain: open to anyone,
 * it would let whoever last claimed a business show their version of it here.
 */
export default async function FactsPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await ready();
  const business = await db.getBusiness(slug);
  if (!business) notFound();
  const session = await getSession();
  const owned = session ? await getOwnedBusiness(session) : null;
  if (owned?.id !== business.id) notFound();
  const facts = await db.latestFacts(business.id);
  if (!facts) notFound();
  const body = factsPageBody(facts, business);
  const { copy, href } = await getI18n();
  return (
    <>
      <div className="border-b-[1.5px] border-line bg-panel-2">
        <div className="wrap flex h-12 items-center justify-between text-[13px] text-muted">
          <span>{copy.factsPage.preview}</span>
          <a href={href("/app")} className="font-semibold text-ink">
            {copy.nav.dashboard}
          </a>
        </div>
      </div>
      <div className="bg-white">
        <div
          className="mx-auto max-w-[40rem] px-4 py-8 [&_a]:text-blue [&_dd]:mb-2 [&_dt]:font-semibold [&_h1]:text-[28px] [&_h1]:font-extrabold [&_h2]:mt-7 [&_h2]:border-t-[1.5px] [&_h2]:border-line [&_h2]:pt-4 [&_h2]:text-[16px] [&_h2]:font-bold [&_th]:pr-6 [&_th]:text-left [&_th]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_.meta]:text-[14px] [&_.meta]:text-muted"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </>
  );
}
