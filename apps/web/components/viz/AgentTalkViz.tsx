import { getI18n } from "@/lib/i18n";
import { Chip, Scene } from "./Scene";

/**
 * Two assistants asking two bakeries the same question (14s). One bakery has
 * nothing readable and is passed over; the other has a facts page, answers
 * with a date and a source, and gets the order.
 */
export async function AgentTalkViz() {
  const { copy } = await getI18n();
  const S = copy.landing.agents.scene;
  const lanes = [
    { ...S.noFacts, tone: "grey" as const, t: 0.12, source: null as string | null },
    { ...S.withFacts, tone: "green" as const, t: 0.46 },
  ];
  return (
    <Scene seconds={14} label={S.label} caption={S.caption}>
      <div className="sc-agent-head">
        <span className="sc-agent-bot">
          <i />
          {S.customer}
        </span>
        <span className="sc-meta">{S.task}</span>
      </div>
      <div className="sc-agent-lanes">
        {lanes.map((l) => (
          <div key={l.name} className={`sc-agent-lane is-${l.tone}`} data-show={l.t.toFixed(2)}>
            <div className="sc-agent-from" data-show={(l.t + 0.04).toFixed(2)}>
              {l.ask}
            </div>
            <span className="sc-agent-wire" data-draw={`${(l.t + 0.06).toFixed(2)}-${(l.t + 0.12).toFixed(2)}`} />
            <div className="sc-agent-node">
              <strong>{l.name}</strong>
              <span className={l.tone === "grey" ? "sc-meta" : "sc-good"} data-show={(l.t + 0.14).toFixed(2)}>
                {l.reply}
              </span>
              {l.source && (
                <span className="sc-meta" data-show={(l.t + 0.17).toFixed(2)}>
                  {l.source}
                </span>
              )}
            </div>
            <span className="sc-agent-result" data-show={(l.t + 0.22).toFixed(2)} {...(l.tone === "green" ? { "data-pulse": (l.t + 0.23).toFixed(2) } : {})}>
              <Chip tone={l.tone}>{l.result}</Chip>
            </span>
          </div>
        ))}
      </div>
    </Scene>
  );
}
