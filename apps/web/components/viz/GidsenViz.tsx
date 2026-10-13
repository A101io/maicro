import { copy } from "@maicro/core/copy";
import { Chip, Dot, Scene } from "./Scene";

const START = { r: "red", x: "grey", g: "green" } as const;

/**
 * Sixteen sources with three different numbers (14s). The facts page goes
 * live, the same facts go out to every source in a wave, and the three
 * assistants stop giving the old number.
 */
export function GidsenViz() {
  const S = copy.landing.scenes.gidsen;
  return (
    <Scene seconds={14} label={S.label} caption={S.caption}>
      <div className="sc-stack sc-phase">
        <Chip tone="red" data-show="0-0.56">
          {S.before}
        </Chip>
        <Chip tone="green" data-show="0.6">
          {S.after}
        </Chip>
      </div>
      <div className="sc-facts" data-pulse="0.27">
        <div className="sc-facts-head">
          <span>{S.factsTitle}</span>
          <span className="sc-meta">{S.factsHost}</span>
        </div>
        <div className="sc-facts-body">
          {S.facts.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </div>
      <span className="sc-flow" data-draw="0.27-0.33" />
      <ul className="sc-grid">
        {S.sources.map(([name, start], i) => {
          const at = (0.33 + i * 0.016).toFixed(3);
          return (
            <li key={name} className="sc-cell">
              {start === "g" ? (
                <Dot tone="green" />
              ) : (
                <span className="sc-stack">
                  <Dot tone={START[start as "r" | "x"]} data-show={`0-${at}`} />
                  <Dot tone="green" data-show={at} data-pulse={at} />
                </span>
              )}
              <span>{name}</span>
            </li>
          );
        })}
      </ul>
      <div className="sc-engines">
        {S.engines.map((e, i) => {
          const at = (0.66 + i * 0.04).toFixed(2);
          return (
            <span key={e} className="sc-engine">
              <strong>{e}</strong>
              <span className="sc-stack">
                <Chip tone="red" data-show={`0-${at}`}>
                  {S.engineWrong}
                </Chip>
                <Chip tone="green" data-show={at}>
                  {S.engineRight}
                </Chip>
              </span>
            </span>
          );
        })}
      </div>
    </Scene>
  );
}
