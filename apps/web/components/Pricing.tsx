import Link from "next/link";
import { copy } from "@maicro/core/copy";

function PlanCard({ plan, chip, href, cta }: { plan: typeof copy.landing.pricing.setup | typeof copy.landing.pricing.monitor; chip?: string; href: string; cta: string }) {
  return (
    <div className="card flex flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[20px] font-semibold">{plan.name}</h3>
        {chip && <span className="chip-neutral">{chip}</span>}
      </div>
      <p className="mt-1 text-[15px] text-secondary">{plan.audience}</p>
      <p className="mt-5 flex items-baseline gap-2">
        <span className="font-mono text-[40px] leading-none">{plan.price}</span>
        <span className="text-[16px] text-secondary">{plan.unit}</span>
      </p>
      <ul className="mt-5 space-y-2 text-[15px]">
        {plan.includes.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-ink" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="mono mt-5 border-t border-rule pt-4">{plan.limit}</p>
      <Link href={href} className="btn-secondary mt-5 no-underline hover:no-underline">
        {cta}
      </Link>
    </div>
  );
}

export function Pricing() {
  const p = copy.landing.pricing;
  return (
    <section id="prijzen" className="section rule-top">
      <div className="container">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="h2">{p.h2}</h2>
            <p className="mt-2 text-[17px]">{p.sub}</p>
          </div>
          <p className="mono">{p.exclVat}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PlanCard plan={p.setup} chip={p.freeChip} href="/#controle" cta={copy.landing.hero.button} />
          <PlanCard plan={p.monitor} chip={p.monitor.mostChosen} href="/#controle" cta={copy.landing.hero.button} />
        </div>
        <div className="mt-4 flex flex-col gap-1 text-[13px] text-secondary sm:flex-row sm:justify-between">
          <p>{p.footnote}</p>
          <p>
            <Link href="mailto:controle@maicro.nl">{p.multi}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
