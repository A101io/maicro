import type { Metadata } from "next";
import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScanField } from "@/components/ScanField";
import { PriceBlock } from "@/components/PriceBlock";

export const metadata: Metadata = { title: copy.pricing.title, description: copy.pricing.lead };

/** Pricing on its own page: the same two plans as the landing, plus how paying works. */
export default function PricingPage() {
  const P = copy.pricing;
  return (
    <>
      <SiteHeader variant="short" />
      <main>
        <section className="wrap grid grid-cols-1 items-end gap-8 pb-12 pt-8 sm:pt-12 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <h1 className="h1 enter">{P.h1}</h1>
            <p className="lead enter max-w-[48ch]" style={{ "--d": "100ms" } as React.CSSProperties}>
              {P.lead}
            </p>
          </div>
          <div className="enter flex flex-col gap-2 lg:col-span-5" style={{ "--d": "200ms" } as React.CSSProperties}>
            <ScanField id="prijzen" button={P.start} note={false} />
            <p className="text-[14px] text-muted">{P.startNote}</p>
          </div>
        </section>
        <section className="bg-dark text-white">
          <div className="wrap section">
            <PriceBlock />
          </div>
        </section>
        <section className="wrap section grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <h2 className="h2 lg:col-span-4">{P.faqTitle}</h2>
          <div data-motion="stagger" className="flex flex-col lg:col-span-8">
            {P.faq.map((it, i) => (
              <details key={it.q} className={`faq border-t-[1.5px] border-line py-[18px] ${i === P.faq.length - 1 ? "border-b-[1.5px]" : ""}`}>
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
      </main>
      <SiteFooter />
    </>
  );
}
