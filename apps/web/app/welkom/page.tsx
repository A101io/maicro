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
      <SiteHeader minimal />
      <main className="container max-w-[720px] py-12 sm:py-16">
        {sp.mock === "1" && <p className="mono mb-4">{copy.checkout.mockNotice}</p>}
        <h1 className="h2">{w.h1}</h1>
        <p className="mt-3 text-[17px]">{w.body}</p>
        <ol className="mt-8 divide-y divide-rule border-y border-rule">
          {w.steps.map((s, i) => (
            <li key={s.title} className="grid gap-2 py-5 sm:grid-cols-[40px_1fr_auto] sm:items-center sm:gap-4">
              <span className="font-mono text-[13px] text-secondary">0{i + 1}</span>
              <div>
                <h2 className="font-sans text-[18px] font-semibold tracking-normal">{s.title}</h2>
                <p className="mt-1 text-[15px] text-secondary">{s.body}</p>
              </div>
              <Link href={session ? s.href : `/inloggen?next=${encodeURIComponent(s.href)}${sp.business ? `&business=${sp.business}` : ""}`} className={i === 0 ? "btn-primary no-underline hover:no-underline" : "btn-small no-underline hover:no-underline"}>
                {s.cta}
              </Link>
            </li>
          ))}
        </ol>
        {!session && <p className="mono mt-6">{w.loginHint}</p>}
      </main>
      <SiteFooter />
    </>
  );
}
