import Link from "next/link";
import { getI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/LangSwitch";
import { Logo } from "@/components/Logo";

/**
 * Footer. `variant="full"`: four columns + legal line (landing, result).
 * `variant="short"`: one line, legal left and a note right (sector pages, grey result).
 */
export async function SiteFooter({ variant = "full", note, tagline }: { variant?: "full" | "short"; note?: string; tagline?: string }) {
  const { copy, href } = await getI18n();
  const f = copy.landing.footer;
  if (variant === "short") {
    return (
      <footer className="border-t-[1.5px] border-line ground-cream">
        <div className="wrap flex flex-wrap justify-between gap-x-6 gap-y-2 py-10 text-[13px] text-muted">
          <span>{f.legal}</span>
          <span>{note ?? f.copyright}</span>
        </div>
      </footer>
    );
  }
  return (
    <footer className="border-t-[1.5px] border-line ground-cream">
      <div className="wrap flex flex-col gap-10 pb-10 pt-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-2.5">
            <Logo size={22} />
            <span className="max-w-[28ch] text-[14px] leading-[1.5] text-muted">{tagline ?? f.tagline}</span>
            {note ? <span className="text-[13px] text-muted">{note}</span> : <LangSwitch />}
          </div>
          {f.columns.map((c) => (
            <div key={c.title} className="flex flex-col gap-2.5 text-[14px]">
              <span className="font-bold">{c.title}</span>
              {c.links.map((l) => (
                <Link key={l.label} href={href(l.href)} className="nav-link text-ink-2">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 border-t-[1.5px] border-line pt-6 text-[13px] leading-[1.5] text-muted">
          <span>{f.legal}</span>
          <span>{f.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
