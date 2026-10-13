import { copy } from "@maicro/core/copy";
import { AgentTalkViz } from "@/components/viz/AgentTalkViz";

/** Where this is going: assistants that ask each other, the terms, and what Maicro does with them. */
export function AgentsSection() {
  const A = copy.landing.agents;
  return (
    <section id="straks" className="ground-mint">
      <div className="wrap section flex flex-col gap-12">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <h2 className="h2">{A.h2}</h2>
            <p className="lead">{A.body}</p>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <AgentTalkViz />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="h2-sm">{A.termsTitle}</h3>
          <dl data-motion="stagger" className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {A.terms.map((t) => (
              <div key={t.term} className="card-sm flex flex-col gap-1.5 p-5">
                <dt className="text-[16px] font-extrabold">{t.term}</dt>
                <dd className="text-[15px] leading-[1.5] text-ink-2">{t.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-5 border-t-[1.5px] border-line pt-10">
          <h3 className="h2-sm">{A.usTitle}</h3>
          <div data-motion="stagger" className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {A.us.map((u, i) => (
              <div key={u.title} className="flex flex-col gap-2">
                <span data-pop className={`flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-extrabold text-white ${["bg-groen", "bg-blue", "bg-ink"][i]}`}>
                  {i + 1}
                </span>
                <span className="text-[18px] font-extrabold">{u.title}</span>
                <span className="text-[15px] leading-[1.55] text-ink-2">{u.body}</span>
              </div>
            ))}
          </div>
          <p className="fine">{A.footnote}</p>
        </div>
      </div>
    </section>
  );
}
