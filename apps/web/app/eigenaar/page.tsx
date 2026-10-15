import type { Metadata } from "next";
import type { CopyShape } from "@vidalo/core/copy";
import { getCopy, getI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getCopy();
  return { title: copy.owner.h1, robots: { index: false } };
}
export const dynamic = "force-dynamic";

type Reason = keyof CopyShape["owner"]["reasons"];

/** Where /api/google/callback sends someone whose Google account did not prove ownership. */
export default async function OwnerFailedPage({ searchParams }: { searchParams: Promise<{ fout?: string; business?: string }> }) {
  const sp = await searchParams;
  const { copy } = await getI18n();
  const O = copy.owner;
  const reason: Reason = sp.fout && sp.fout in O.reasons ? (sp.fout as Reason) : "error";
  const retry = sp.business ? `/api/google/start?business=${encodeURIComponent(sp.business)}` : "/api/google/start";
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="wrap max-w-[640px] py-16 sm:py-24">
        <h1 className="h2">{O.h1}</h1>
        <p className="lead mt-4" aria-live="polite">
          {O.reasons[reason]}
        </p>
        {reason !== "no_place_id" && (
          <a href={retry} className="btn-primary mt-8 inline-flex h-[52px]">
            {O.retry}
          </a>
        )}
        <p className="mt-6 text-[15px] text-ink-2">{O.contact}</p>
      </main>
      <SiteFooter variant="short" />
    </>
  );
}
