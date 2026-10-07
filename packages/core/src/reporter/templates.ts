/**
 * Dutch, plain-text-first customer e-mails (docs/MESSAGING.md).
 *
 * Rules: informal "je", calm verbs (controleren, vinden, herstellen, laten
 * zien), one number per claim, no exclamation marks, no countdowns, no jargon
 * (no GEO/AEO/LLM/prompt/credits/garantie). Every mail is pure data in → text out.
 */
import type { Business, Engine, Finding } from "../types.js";
import { ENGINE_LABEL } from "../types.js";
import { findingWordsNl, hostOfUrl } from "../shared/facts-nl.js";
import { fixPathFor } from "../fixer/paths.js";
import { formatDateNl } from "../publisher/render.js";

export interface Mail {
  subject: string;
  text: string;
  html: string;
}

export interface Links {
  dashboardUrl: string;
  factsPageUrl?: string | null;
  resultUrl?: string | null;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Minimal HTML version of a plain-text mail: paragraphs, links clickable. */
export function textToHtml(text: string): string {
  const paras = text.trim().split(/\n{2,}/);
  const body = paras
    .map((p) => {
      const lines = p.split("\n").map((l) => esc(l).replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1">$1</a>'));
      return `<p style="margin:0 0 1em">${lines.join("<br>")}</p>`;
    })
    .join("\n");
  return `<!doctype html><html lang="nl"><body style="font:16px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#1b1b1b;max-width:40rem;padding:1rem">${body}</body></html>`;
}

function mail(subject: string, text: string): Mail {
  return { subject, text, html: textToHtml(text) };
}

export function engineName(engine: Engine): string {
  return ENGINE_LABEL[engine] ?? engine;
}

/** "12 van 12 antwoorden kloppen" / "2 fouten gevonden, 1 hersteld, 1 in behandeling". */
export function statusLine(stats: { totalAnswers: number; wrongAnswers: number; resolved: number; inProgress: number; unfixable?: number }): string {
  if (stats.wrongAnswers === 0 && stats.resolved === 0) return `${stats.totalAnswers} van ${stats.totalAnswers} antwoorden kloppen`;
  const found = stats.wrongAnswers + stats.resolved;
  const parts = [`${found} ${found === 1 ? "fout" : "fouten"} gevonden`];
  if (stats.resolved) parts.push(`${stats.resolved} hersteld`);
  if (stats.inProgress) parts.push(`${stats.inProgress} in behandeling`);
  if (stats.unfixable) parts.push(`${stats.unfixable} niet te herstellen`);
  return parts.join(", ");
}

function sourceLine(f: Finding): string {
  const host = hostOfUrl(f.sourceUrl);
  switch (f.sourceType) {
    case "none":
      return "uit het geheugen van het model";
    case "other_entity":
      return host ? `een ander bedrijf met dezelfde naam (${host})` : "een ander bedrijf met dezelfde naam";
    case "owned_website":
      return host ? `je eigen website (${host})` : "je eigen website";
    case "owned_facts_page":
      return "je feitenpagina";
    default:
      return host ?? "onbekende bron";
  }
}

/** One finding as a short block: Vraag / Engine zei / Klopt niet / Bron / Wat we doen. */
export function findingBlock(f: Finding, opts: { promptText?: string | null; nextStep?: string } = {}): string {
  const w = findingWordsNl(f);
  const next = opts.nextStep ?? fixPathFor(f.sourceType).labelNl;
  const other = f.sourceType === "other_entity";
  const lines = [
    opts.promptText ? `Vraag: ${opts.promptText}` : `Over: ${w.what}`,
    other ? `${engineName(f.engine)} antwoordde over een ander bedrijf met dezelfde naam (${w.frequency})` : `${engineName(f.engine)} zei: ${w.wrong} (${w.frequency})`,
    other ? `Klopt niet. Jouw gegeven is: ${w.correct}` : `Klopt niet. Het is: ${w.correct}`,
    `Waar het vandaan komt: ${sourceLine(f)}`,
    `Wat we doen: ${next}`,
  ];
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// 1. Welcome after checkout (4 steps)
// ---------------------------------------------------------------------------

export interface WelcomeData {
  business: Pick<Business, "name" | "place" | "domain">;
  links: Links & { confirmFactsUrl: string; googleConnectUrl: string };
  /** CNAME instruction when the owner has a domain */
  cname?: { host: string; target: string } | null;
}

export function welcomeEmail(d: WelcomeData): Mail {
  const subject = `Welkom bij Maicro: 4 stappen voor ${d.business.name}`;
  const dns = d.cname
    ? `2. Eén DNS-regel
   Maak bij je domeinbeheerder een CNAME aan:
   ${d.cname.host}  →  ${d.cname.target}
   Wij controleren elke 10 minuten of hij er staat. Lukt het niet, dan zetten we de pagina op ons eigen adres.`
    : `2. Feitenpagina
   Je hebt geen eigen domein opgegeven. We zetten je feitenpagina op ${d.links.factsPageUrl ?? "ons adres"}. Later verhuizen kan altijd.`;
  const text = `Hoi,

Bedankt voor je bestelling. Vanaf nu controleren we wat AI over ${d.business.name} zegt en herstellen we fouten bij de bron. Om te starten vragen we 4 dingen van je. Samen ongeveer 5 minuten.

1. Bevestig je gegevens
   Adres, telefoon, openingstijden, wat je wel en niet doet. We hebben ze alvast ingevuld, jij kijkt ze na.
   ${d.links.confirmFactsUrl}

${dns}

3. Log één keer in bij Google
   Daarmee mogen we je Google Bedrijfsprofiel lezen en de openingstijden, het telefoonnummer en de website gelijk zetten.
   ${d.links.googleConnectUrl}

4. Wij doen de rest
   Binnen 48 uur staat je feitenpagina live, zijn Google, Bing en Apple gelijkgezet en draait de eerste volledige controle. Het resultaat krijg je per mail.

Je overzicht: ${d.links.dashboardUrl}

Vragen? Antwoord op deze mail.

Groet,
Maicro
`;
  return mail(subject, text);
}

// ---------------------------------------------------------------------------
// 2. Baseline summary (day 2)
// ---------------------------------------------------------------------------

export interface BaselineData {
  business: Pick<Business, "name" | "place">;
  checkedAt: string;
  totalAnswers: number;
  wrongAnswers: number;
  findings: Finding[];
  promptsById?: Record<string, string>;
  links: Links;
  engines: Engine[];
}

export function baselineSummaryEmail(d: BaselineData): Mail {
  const engines = d.engines.map(engineName).join(", ");
  const subject = d.wrongAnswers === 0
    ? `Eerste controle van ${d.business.name}: alle ${d.totalAnswers} antwoorden kloppen`
    : `Eerste controle van ${d.business.name}: ${d.wrongAnswers} ${d.wrongAnswers === 1 ? "antwoord klopt" : "antwoorden kloppen"} niet`;
  const blocks = d.findings.slice(0, 8).map((f) => findingBlock(f)).join("\n\n");
  const text = `Hoi,

Op ${formatDateNl(d.checkedAt)} stelden we ${d.totalAnswers} vragen over ${d.business.name} aan ${engines}. ${
    d.wrongAnswers === 0
      ? "Alle antwoorden klopten. We controleren volgende maand opnieuw."
      : `${d.wrongAnswers} ${d.wrongAnswers === 1 ? "antwoord klopte" : "antwoorden klopten"} niet. Dit is wat we vonden en wat we eraan doen.`
  }
${blocks ? `\n${blocks}\n` : ""}${d.findings.length > 8 ? `\nEn nog ${d.findings.length - 8} ${d.findings.length - 8 === 1 ? "fout" : "fouten"}, zie je overzicht.\n` : ""}
Elke fout controleren we opnieuw zodra de bron is aangepast. Je hoort van ons als een antwoord is hersteld, met het antwoord van voor en na.

Je overzicht: ${d.links.dashboardUrl}

Groet,
Maicro
`;
  return mail(subject, text);
}

// ---------------------------------------------------------------------------
// 3. Resolution notice (before / after)
// ---------------------------------------------------------------------------

export interface ResolutionData {
  business: Pick<Business, "name" | "place">;
  finding: Finding;
  before: { quote: string; at: string };
  after: { quote: string; at: string };
  days: number;
  links: Links;
}

export function resolutionNoticeEmail(d: ResolutionData): Mail {
  const w = findingWordsNl(d.finding);
  const engine = engineName(d.finding.engine);
  const subject = `Hersteld: ${engine} zegt nu "${w.correct}" over ${d.business.name}`;
  const text = `Hoi,

${engine} gaf een verkeerd antwoord over ${w.what} van ${d.business.name}. Dat is hersteld.

Voor (${formatDateNl(d.before.at)}):
"${d.before.quote}"

Na (${formatDateNl(d.after.at)}):
"${d.after.quote}"

Bron: ${sourceLine(d.finding)}, hersteld in ${d.days} ${d.days === 1 ? "dag" : "dagen"}.

We blijven dit antwoord elke maand controleren.

Je overzicht: ${d.links.dashboardUrl}

Groet,
Maicro
`;
  return mail(subject, text);
}

// ---------------------------------------------------------------------------
// 4. Monthly report
// ---------------------------------------------------------------------------

export interface ProofCard {
  findingId: string;
  engine: Engine;
  what: string;
  before: string;
  after: string;
  source: string;
  days: number;
  resolvedAt: string;
}

export interface OpenFindingLine {
  finding: Finding;
  nextStep: string;
  since: string;
}

export interface MonthlyReportData {
  business: Pick<Business, "name" | "place">;
  month: string; // "oktober 2026"
  checkedAt: string;
  totalAnswers: number;
  wrongAnswers: number;
  resolved: number;
  inProgress: number;
  unfixable: number;
  proofCards: ProofCard[];
  openFindings: OpenFindingLine[];
  links: Links;
  engines: Engine[];
}

export function monthlyReportEmail(d: MonthlyReportData): Mail {
  const line = statusLine(d);
  const subject = `${d.business.name} in ${d.month}: ${line}`;
  const proofs = d.proofCards
    .map((p) => `${engineName(p.engine)} zei: "${p.before}"\nNu: "${p.after}"\nBron: ${p.source}, hersteld in ${p.days} ${p.days === 1 ? "dag" : "dagen"}.`)
    .join("\n\n");
  const open = d.openFindings.map((o) => findingBlock(o.finding, { nextStep: o.nextStep })).join("\n\n");
  const text = `Hoi,

Controle van ${formatDateNl(d.checkedAt)}: ${line}.

We stelden ${d.totalAnswers} vragen over ${d.business.name} aan ${d.engines.map(engineName).join(", ")}.
${proofs ? `\nHersteld deze maand\n\n${proofs}\n` : ""}${open ? `\nNog open\n\n${open}\n` : ""}${
    !proofs && !open ? "\nEr is niets te herstellen. Fijn.\n" : ""
  }
Alle antwoorden, met datum en bron: ${d.links.dashboardUrl}

Groet,
Maicro
`;
  return mail(subject, text);
}

// ---------------------------------------------------------------------------
// 5. Follow-ups for non-customers (day 7 / day 21)
// ---------------------------------------------------------------------------

export interface FollowUpData {
  business: Pick<Business, "name" | "place">;
  wrongAnswers: number;
  totalAnswers: number;
  /** the most striking wrong answer, used in the day-21 subject */
  example: Finding | null;
  links: Links & { resultUrl: string };
  priceSetupEur: number;
  priceMonitorEur: number;
}

export function followUpEmail(d: FollowUpData, day: 7 | 21): Mail {
  const w = d.example ? findingWordsNl(d.example) : null;
  const engine = d.example ? engineName(d.example.engine) : "ChatGPT";
  if (day === 7) {
    const subject = `${d.wrongAnswers} ${d.wrongAnswers === 1 ? "antwoord" : "antwoorden"} over ${d.business.name} ${d.wrongAnswers === 1 ? "klopt" : "kloppen"} niet`;
    const text = `Hoi,

Een week geleden controleerden we wat AI over ${d.business.name} zegt. Van de ${d.totalAnswers} antwoorden klopten er ${d.wrongAnswers} niet.${
      w ? ` ${engine} zei bijvoorbeeld "${w.wrong}" over ${w.what}; het is ${w.correct}.` : ""
    }

Een klant die dit vraagt, krijgt dit antwoord. Niet één keer, elke keer, tot de bron verandert.

Het volledige resultaat, met de bron van elke fout: ${d.links.resultUrl}

Zelf oplossen kan: de bronnen staan erbij. Liever dat wij het doen? Instellen kost ${d.priceSetupEur} euro eenmalig, bewaking ${d.priceMonitorEur} euro per maand, maandelijks opzegbaar. Prijzen excl. btw.

Groet,
Maicro
`;
    return mail(subject, text);
  }
  const subject = w ? `Nog steeds "${w.wrong}"` : `Nog steeds ${d.wrongAnswers} ${d.wrongAnswers === 1 ? "fout" : "fouten"} over ${d.business.name}`;
  const text = `Hoi,

Drie weken geleden zagen we dat ${w ? `${engine} "${w.wrong}" zegt over ${w.what} van ${d.business.name}` : `${d.wrongAnswers} antwoorden over ${d.business.name} niet klopten`}. We hebben het vandaag opnieuw gecontroleerd. Het staat er nog.

Resultaat: ${d.links.resultUrl}

Dit is de laatste mail hierover. Wil je dat wij de bronnen herstellen, dan regel je dat via de link. Zo niet, dan laten we je met rust.

Groet,
Maicro
`;
  return mail(subject, text);
}

// ---------------------------------------------------------------------------
// 6. Unfixable notice
// ---------------------------------------------------------------------------

export interface UnfixableData {
  business: Pick<Business, "name" | "place">;
  finding: Finding;
  note: string;
  triedDays: number;
  links: Links;
}

export function unfixableNoticeEmail(d: UnfixableData): Mail {
  const w = findingWordsNl(d.finding);
  const engine = engineName(d.finding.engine);
  const subject = `Niet hersteld: ${engine} over ${w.what} van ${d.business.name}`;
  const path = fixPathFor(d.finding.sourceType);
  const text = `Hoi,

${engine} zegt nog steeds "${w.wrong}" over ${w.what} van ${d.business.name}. Het is ${w.correct}. We hebben dit ${d.triedDays} dagen geprobeerd te herstellen.

Waarom het niet lukte: ${d.note}

Wat we deden: ${path.labelNl}

Wat nu: we laten dit antwoord in je overzicht staan en controleren het elke maand opnieuw. ${
    d.finding.sourceType === "none"
      ? "Antwoorden uit het geheugen van het model veranderen pas bij een nieuwe versie van dat model. Zodra dat gebeurt, zie je het in je rapport."
      : "Verandert de bron alsnog, dan hoor je het van ons."
  }

Je overzicht: ${d.links.dashboardUrl}

Groet,
Maicro
`;
  return mail(subject, text);
}
