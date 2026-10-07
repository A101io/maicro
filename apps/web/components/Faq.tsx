import { copy } from "@maicro/core/copy";

export function Faq() {
  const f = copy.landing.faq;
  return (
    <section id="vragen" className="section rule-top">
      <div className="container grid grid-cols-1 gap-8 lg:grid-cols-12">
        <h2 className="h2 lg:col-span-4">{f.h2}</h2>
        <div className="divide-y divide-rule border-y border-rule lg:col-span-8">
          {f.items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex items-center justify-between gap-4 py-4 text-[17px] font-medium">
                <span>{item.q}</span>
                <span aria-hidden className="font-mono text-secondary group-open:hidden">+</span>
                <span aria-hidden className="hidden font-mono text-secondary group-open:inline">–</span>
              </summary>
              <p className="max-w-[60ch] pb-5 text-[16px] text-ink">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
