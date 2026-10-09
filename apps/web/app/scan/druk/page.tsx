import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: copy.scanBusy.title, robots: { index: false } };

/** Where /api/scan sends people once the daily free-scan cap is reached. */
export default function ScanBusyPage() {
  const b = copy.scanBusy;
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="wrap max-w-[640px] py-16 sm:py-24">
        <h1 className="h2">{b.title}</h1>
        <p className="lead mt-4">{b.body}</p>
        <Link href="/" className="btn-sm mt-8 inline-flex">
          {b.back}
        </Link>
      </main>
      <SiteFooter variant="short" />
    </>
  );
}
