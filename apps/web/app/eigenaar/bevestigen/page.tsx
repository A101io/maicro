import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ready } from "@/lib/db";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Claiming a business from its report. Signed out: log in first (any e-mail,
 * it proves nothing). Signed in: one button to Google, which does the proving.
 */
export default async function ClaimPage({ searchParams }: { searchParams: Promise<{ business?: string }> }) {
  const sp = await searchParams;
  if (!sp.business) notFound();
  const business = await (await ready()).getBusiness(sp.business);
  if (!business) notFound();
  const session = await getSession();
  const O = copy.owner;
  const here = `/eigenaar/bevestigen?business=${encodeURIComponent(business.id)}`;
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="wrap max-w-[640px] py-16 sm:py-24">
        <h1 className="h2">{O.claimH1(business.name)}</h1>
        <p className="lead mt-4">{O.claimBody}</p>
        {session ? (
          <a href={`/api/google/start?business=${encodeURIComponent(business.id)}`} className="btn-primary mt-8 inline-flex h-[52px]">
            {O.claimButton}
          </a>
        ) : (
          <a href={`/inloggen?next=${encodeURIComponent(here)}&business=${encodeURIComponent(business.id)}`} className="btn-primary mt-8 inline-flex h-[52px]">
            {O.claimLogin}
          </a>
        )}
        <p className="mt-6 text-[15px] text-ink-2">{O.contact}</p>
      </main>
      <SiteFooter variant="short" />
    </>
  );
}
