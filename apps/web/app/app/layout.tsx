import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { Wordmark } from "@/components/Wordmark";
import { requireOwner } from "@/lib/owner";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { business, session } = await requireOwner();
  const d = copy.dashboard;
  return (
    <>
      <header className="border-b border-rule bg-white">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/app" className="no-underline hover:no-underline" aria-label={copy.brand}>
              <Wordmark />
            </Link>
            <span className="hidden font-mono text-[13px] text-secondary sm:inline">
              {business.name}, {business.place}
            </span>
          </div>
          <nav className="flex items-center gap-4 text-[14px]">
            <Link href="/app" className="text-ink no-underline hover:underline">{d.h1}</Link>
            <Link href="/app/gegevens" className="text-ink no-underline hover:underline">{d.setupSteps.facts}</Link>
            <Link href="/app/domein" className="hidden text-ink no-underline hover:underline sm:inline">{d.setupSteps.domain}</Link>
            <Link href="/app/google" className="hidden text-ink no-underline hover:underline sm:inline">{d.setupSteps.google}</Link>
            <form action="/auth/uitloggen" method="post">
              <button type="submit" className="text-secondary hover:underline" title={session.email}>
                {copy.nav.logout}
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container max-w-[960px] py-8 sm:py-12">{children}</main>
    </>
  );
}
