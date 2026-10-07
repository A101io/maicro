import { copy } from "@maicro/core/copy";

/**
 * 2015 → 2026 → 2027: ten links you choose from, one answer, the AI arranges it.
 * Line drawings in ink at 1px; no colour.
 */
export function ThreePanels() {
  const p = copy.landing.changed.panels;
  const stroke = "#15202B";
  const common = { fill: "none", stroke, strokeWidth: 1.25, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* 2015 */}
      <li className="card p-5">
        <svg viewBox="0 0 240 140" className="h-auto w-full" role="img" aria-label="2015: zoeken, tien links, jij kiest">
          <rect x="16" y="14" width="208" height="20" rx="4" {...common} />
          <circle cx="212" cy="24" r="4" {...common} />
          <line x1="215" y1="27" x2="219" y2="31" {...common} />
          {Array.from({ length: 10 }).map((_, i) => {
            const y = 48 + i * 9;
            return (
              <g key={i}>
                <line x1="16" y1={y} x2={16 + (i % 3 === 0 ? 120 : i % 3 === 1 ? 150 : 95)} y2={y} stroke={i === 3 ? "#1F4FD8" : stroke} strokeWidth={i === 3 ? 2 : 1} strokeLinecap="round" />
              </g>
            );
          })}
          <path d="M196 74 l0 14 l4 -4 l4 8 l3 -1 l-4 -8 l6 0 z" fill="#15202B" stroke="none" />
        </svg>
        <p className="mt-3 flex flex-col">
          <span className="flex items-baseline gap-3">
            <span className="font-mono text-[13px] text-secondary">{p[0].year}</span>
            <span className="font-semibold">{p[0].title}</span>
          </span>
          <span className="text-[14px] text-secondary">{p[0].line}</span>
        </p>
      </li>
      {/* 2026 */}
      <li className="card p-5">
        <svg viewBox="0 0 240 140" className="h-auto w-full" role="img" aria-label="2026: vragen, één antwoord">
          <path d="M16 14 h150 a4 4 0 0 1 4 4 v18 a4 4 0 0 1 -4 4 h-120 l-10 8 v-8 h-20 a4 4 0 0 1 -4 -4 v-18 a4 4 0 0 1 4 -4 z" {...common} />
          <line x1="28" y1="27" x2="150" y2="27" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
          <rect x="16" y="62" width="208" height="62" rx="4" {...common} />
          <circle cx="30" cy="76" r="5" {...common} />
          <line x1="42" y1="78" x2="140" y2="78" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="28" y1="94" x2="200" y2="94" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
          <line x1="28" y1="104" x2="180" y2="104" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
          <line x1="28" y1="114" x2="120" y2="114" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
        </svg>
        <p className="mt-3 flex flex-col">
          <span className="flex items-baseline gap-3">
            <span className="font-mono text-[13px] text-secondary">{p[1].year}</span>
            <span className="font-semibold">{p[1].title}</span>
          </span>
          <span className="text-[14px] text-secondary">{p[1].line}</span>
        </p>
      </li>
      {/* 2027 */}
      <li className="card p-5">
        <svg viewBox="0 0 240 140" className="h-auto w-full" role="img" aria-label="2027: vragen, de AI regelt het">
          <path d="M16 14 h150 a4 4 0 0 1 4 4 v18 a4 4 0 0 1 -4 4 h-120 l-10 8 v-8 h-20 a4 4 0 0 1 -4 -4 v-18 a4 4 0 0 1 4 -4 z" {...common} />
          <line x1="28" y1="27" x2="150" y2="27" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
          <rect x="16" y="62" width="120" height="62" rx="4" {...common} />
          <circle cx="30" cy="76" r="5" {...common} />
          <line x1="42" y1="78" x2="110" y2="78" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="28" y1="94" x2="120" y2="94" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
          <line x1="28" y1="104" x2="100" y2="104" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
          <line x1="136" y1="93" x2="160" y2="93" {...common} />
          <path d="M156 89 l4 4 l-4 4" {...common} />
          <rect x="164" y="70" width="60" height="46" rx="4" {...common} />
          <line x1="164" y1="82" x2="224" y2="82" stroke={stroke} strokeWidth="1" />
          <path d="M184 98 l6 6 l12 -12" stroke="#15202B" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-3 flex flex-col">
          <span className="flex items-baseline gap-3">
            <span className="font-mono text-[13px] text-secondary">{p[2].year}</span>
            <span className="font-semibold">{p[2].title}</span>
          </span>
          <span className="text-[14px] text-secondary">{p[2].line}</span>
        </p>
      </li>
    </ol>
  );
}
