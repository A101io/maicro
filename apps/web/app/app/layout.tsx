import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { Wordmark } from "@/components/SiteHeader";
import { requireOwner } from "@/lib/owner";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { business, session } = await requireOwner();
  const d = copy.dashboard;
  const links = [
    { href: "/app", label: d.h1 },
    { href: "/app/gegevens", label: d.setupSteps.facts },
    { href: "/app/domein", label: d.setupSteps.domain },
    { href: "/app/google", label: d.setupSteps.google },
  ];
  return (
    <>
      <header className="site-header site-header--ruled">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 sm:py-5">
          <div className="flex items-center gap-4">
            <Wordmark href="/app" />
            <span className="hidden text-[14px] text-muted sm:inline">
              {business.name}, {business.place}
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-semibold">
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
            <form action="/auth/uitloggen" method="post">
              <button type="submit" className="font-semibold text-muted hover:text-blue" title={session.email}>
                {copy.nav.logout}
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="wrap max-w-[1000px] py-8 sm:py-12">{children}</main>
    </>
  );
}
