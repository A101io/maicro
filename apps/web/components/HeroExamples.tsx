"use client";

import { useState } from "react";
import { FindingCard, type FindingCardProps } from "./FindingCard";
import { copy } from "@maicro/core/copy";

const EXAMPLES: { tab: string; card: FindingCardProps }[] = [
  {
    tab: "Bakkerij",
    card: {
      engine: "ChatGPT",
      date: "7 okt 2026",
      question: "Is Bakkerij De Vries in Haarlem op zondag open?",
      answer: { before: "Ja, Bakkerij De Vries aan de Grote Houtstraat is op zondag ", wrong: "geopend van 9:00 tot 17:00", after: ". Vers brood en gebak zijn de hele dag verkrijgbaar." },
      source: {
        label: "Gevonden bron",
        text: (
          <>
            Openingstijden op <span className="font-mono text-[14px]">openingstijden.nl</span> → zondag 09:00–17:00 (sinds 2023 gesloten op zondag)
          </>
        ),
        chip: { label: "Bron verouderd", tone: "doubt" },
      },
      fix: {
        chip: { label: "Hersteld 8 okt", tone: "ok" },
        text: (
          <>
            Openingstijden bijgewerkt op website en Google-bedrijfsprofiel. <span className="font-mono text-[13px] text-secondary">Hercontrole: 14 okt</span>
          </>
        ),
      },
    },
  },
  {
    tab: "Fysiotherapeut",
    card: {
      engine: "Copilot",
      date: "7 okt 2026",
      question: "Wat is het telefoonnummer van Fysiotherapie Van Dijk in Zwolle?",
      answer: { before: "Je bereikt Fysiotherapie Van Dijk op ", wrong: "038 – 421 77 30", after: ". Bellen kan op werkdagen tussen 8:00 en 17:00." },
      source: {
        label: "Gevonden bron",
        text: (
          <>
            Vermelding op <span className="font-mono text-[14px]">telefoonboek.nl</span> → 038 – 421 77 30 (nummer van de vorige praktijk, 2019)
          </>
        ),
        chip: { label: "Bron verouderd", tone: "doubt" },
      },
      fix: {
        chip: { label: "Hersteld 8 okt", tone: "ok" },
        text: (
          <>
            Correctie ingediend bij telefoonboek.nl en nummer gesynchroniseerd met Bing en Apple. <span className="font-mono text-[13px] text-secondary">Hercontrole: 14 okt</span>
          </>
        ),
      },
    },
  },
  {
    tab: "Installateur",
    card: {
      engine: "Google AI",
      date: "7 okt 2026",
      question: "Plaatst Installatiebedrijf Hendriks in Breda ook warmtepompen?",
      answer: { before: "Installatiebedrijf Hendriks richt zich op cv-ketels en sanitair; ", wrong: "warmtepompen plaatsen ze niet", after: ". Voor warmtepompen kun je beter bij een gespecialiseerd bedrijf terecht." },
      source: {
        label: "Gevonden bron",
        text: (
          <>
            Dienstenpagina op <span className="font-mono text-[14px]">hendriks-installatie.nl/diensten</span> → tekst uit 2021, warmtepompen sinds 2022
          </>
        ),
        chip: { label: "Bron verouderd", tone: "doubt" },
      },
      fix: {
        chip: { label: "Hersteld 8 okt", tone: "ok" },
        text: (
          <>
            Feitenpagina gepubliceerd en dienstenpagina aangepast door de eigenaar. <span className="font-mono text-[13px] text-secondary">Hercontrole: 14 okt</span>
          </>
        ),
      },
    },
  },
];

export function HeroExamples() {
  const [i, setI] = useState(0);
  const current = EXAMPLES[i]!;
  return (
    <div>
      <FindingCard key={i} {...current.card} animate />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[12px] text-secondary">{copy.landing.hero.exampleLabel}</p>
        <div className="flex gap-1" role="tablist" aria-label="Voorbeelden">
          {EXAMPLES.map((e, idx) => (
            <button
              key={e.tab}
              role="tab"
              aria-selected={idx === i}
              onClick={() => setI(idx)}
              className={`rounded-[4px] border px-2 py-0.5 font-mono text-[12px] ${idx === i ? "border-ink bg-ink text-paper" : "border-rule bg-white text-secondary hover:border-ink"}`}
            >
              {e.tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
