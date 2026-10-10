import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Doc = { title: string; intro: string; sections: readonly { h: string; p: readonly string[] }[] };

export function LegalPage({ doc }: { doc: Doc }) {
  const l = copy.legal;
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="wrap max-w-[760px] py-12 sm:py-16">
        {l.draft && <p className="mb-6 rounded-xl border-[1.5px] border-line px-4 py-3 text-[14px] text-ink-2">{l.draftNotice}</p>}
        <h1 className="h2">{doc.title}</h1>
        <p className="mt-2 text-[14px] text-muted">{l.updated}</p>
        <p className="lead mt-6">{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="h3">{s.h}</h2>
            {s.p.map((para) => (
              <p key={para} className="mt-3 text-[16px] leading-relaxed text-ink-2">
                {para}
              </p>
            ))}
          </section>
        ))}
        <p className="mt-12 text-[15px] text-ink-2">{l.contact}</p>
      </main>
      <SiteFooter />
    </>
  );
}
