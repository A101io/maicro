import { getI18n } from "@/lib/i18n";

/** Section 13: Vragen. Plain <details> so it works without JavaScript. */
export async function Faq() {
  const { copy } = await getI18n();
  const V = copy.landing.vragen;
  return (
    <section id="vragen" className="wrap section grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <h2 className="h2 lg:col-span-4">{V.h2}</h2>
      <div data-motion="stagger" className="flex flex-col lg:col-span-8">
        {V.items.map((it, i) => (
          <details key={it.q} className={`faq border-t-[1.5px] border-line py-[18px] ${i === V.items.length - 1 ? "border-b-[1.5px]" : ""}`}>
            <summary className="flex justify-between gap-4 text-[17px] font-bold">
              <span>{it.q}</span>
              <span aria-hidden className="faq-plus text-muted">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-[60ch] text-[16px] leading-[1.6] text-ink-2">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
