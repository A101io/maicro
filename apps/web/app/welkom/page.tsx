import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ mock?: string; session_id?: string; business?: string }> }) {
  const sp = await searchParams;
  const session = await getSession();
  const w = copy.welcome;
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="wrap max-w-[760px] py-12 sm:py-16">
        {sp.mock === "1" && <p className="mb-4 text-[14px] text-muted">{copy.checkout.mockNotice}</p>}
        <h1 className="h2">{w.h1}</h1>
        <p className="lead mt-3">{w.body}</p>
        <ol className="mt-8 divide-y-[1.5px] divide-line border-y-[1.5px] border-line">
          {w.steps.map((s, i) => (
            <li key={s.title} className="grid gap-3 py-5 sm:grid-cols-[44px_1fr_auto] sm:items-center sm:gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[14px] font-extrabold text-white">{i + 1}</span>
              <div>
                <h2 className="h3">{s.title}</h2>
                <p className="mt-1 text-[15px] text-ink-2">{s.body}</p>
              </div>
              <Link href={session ? s.href : `/inloggen?next=${encodeURIComponent(s.href)}${sp.business ? `&business=${sp.business}` : ""}`} className={i === 0 ? "btn-primary h-[52px]" : "btn-sm"}>
                {s.cta}
              </Link>
            </li>
          ))}
        </ol>
        {!session && <p className="mt-6 text-[14px] text-muted">{w.loginHint}</p>}
      </main>
      <SiteFooter />
    </>
  );
}
