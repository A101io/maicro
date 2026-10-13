import Link from "next/link";
import { getI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/LangSwitch";
import { Logo } from "@/components/Logo";

export async function Wordmark({ href = "/" }: { href?: string }) {
  const { href: to } = await getI18n();
  return (
    <Link href={to(href)} className="inline-flex hover:text-ink">
      <Logo size={24} />
    </Link>
  );
}

/**
 * Site header. `variant="full"`: wordmark + section links + Inloggen pill (landing).
 * `variant="short"`: wordmark + two links + Inloggen (sector pages).
 * `variant="minimal"`: wordmark + an optional right-hand line (result, scan, login).
 */
export async function SiteHeader({ variant = "full", right }: { variant?: "full" | "short" | "minimal"; right?: React.ReactNode }) {
  const { copy, href } = await getI18n();
  const n = copy.nav;
  const links =
    variant === "full"
      ? [
          { href: "/hoe-het-werkt", label: n.how },
          { href: "/waarom", label: n.why },
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
    <header className="site-header">
      <div className="wrap flex flex-wrap items-center justify-between gap-4 py-4 sm:py-5">
        <Wordmark />
        {variant === "minimal" ? (
          <span className="flex items-center gap-4">
            {right && <span className="text-[14px] text-muted">{right}</span>}
            <LangSwitch />
          </span>
        ) : (
          <nav className="flex items-center gap-4 text-[15px] font-semibold sm:gap-7">
            {links.map((l) => (
              <Link key={l.href} href={href(l.href)} className="nav-link hidden md:inline">
                {l.label}
              </Link>
            ))}
            {links.length > 0 && (
              <details className="site-menu md:hidden">
                <summary aria-label={n.menu} className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-line">
                  <span aria-hidden className="site-menu-icon" />
                </summary>
                <div className="site-menu-panel">
                  {links.map((l) => (
                    <Link key={l.href} href={href(l.href)}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </details>
            )}
            <LangSwitch />
            <Link href={href("/inloggen")} className="rounded-pill border-[1.5px] border-ink px-[18px] py-[9px] transition-colors duration-200 hover:border-blue">
              {n.login}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
