import Link from "next/link";
import { copy } from "@maicro/core/copy";

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label={copy.brand} className="text-[24px] font-extrabold hover:text-ink" style={{ letterSpacing: "-0.5px" }}>
      {copy.nav.wordmark}
    </Link>
  );
}

/**
 * Site header. `variant="full"`: wordmark + section links + Inloggen pill (landing).
 * `variant="short"`: wordmark + two links + Inloggen (sector pages).
 * `variant="minimal"`: wordmark + an optional right-hand line (result, scan, login).
 */
export function SiteHeader({ variant = "full", right }: { variant?: "full" | "short" | "minimal"; right?: React.ReactNode }) {
  const n = copy.nav;
  const links =
    variant === "full"
      ? [
          { href: "/#werkt", label: n.how },
          { href: "/#criteria", label: n.criteria },
          { href: "/#vak", label: n.sectors },
          { href: "/#prijs", label: n.pricing },
          { href: "/#vragen", label: n.faq },
        ]
      : variant === "short"
        ? [
            { href: "/#werkt", label: n.how },
            { href: "/#prijs", label: n.pricing },
          ]
        : [];
  return (
    <header>
      <div className="wrap flex flex-wrap items-center justify-between gap-4 py-5 sm:py-6">
        <Wordmark />
        {variant === "minimal" ? (
          right && <span className="text-[14px] text-muted">{right}</span>
        ) : (
          <nav className="flex items-center gap-4 text-[15px] font-semibold sm:gap-7">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hidden md:inline">
                {l.label}
              </Link>
            ))}
            <Link href="/inloggen" className="rounded-pill border-[1.5px] border-ink px-[18px] py-[9px] hover:border-blue">
              {n.login}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
