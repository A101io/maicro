import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { Wordmark } from "./Wordmark";

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  const n = copy.nav;
  return (
    <header className="border-b border-rule">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="no-underline hover:no-underline" aria-label={copy.brand}>
          <Wordmark />
        </Link>
        {!minimal && (
          <nav className="flex items-center gap-5 text-[14px]">
            <Link href="/#hoe" className="hidden text-ink no-underline hover:underline sm:inline">{n.how}</Link>
            <Link href="/#voorbeeld" className="hidden text-ink no-underline hover:underline sm:inline">{n.example}</Link>
            <Link href="/#prijzen" className="hidden text-ink no-underline hover:underline sm:inline">{n.pricing}</Link>
            <Link href="/#vragen" className="hidden text-ink no-underline hover:underline md:inline">{n.faq}</Link>
            <Link href="/inloggen" className="text-ink no-underline hover:underline">{n.login}</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
