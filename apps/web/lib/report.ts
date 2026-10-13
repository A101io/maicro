/**
 * From a ScanReport to what the result page shows (docs/DESIGN_G.md "Result"):
 * one row per question, three answer cards, source rows, the plan steps and
 * the hero numbers. Three states by colour: red/orange, green, grey.
 * Never a score: only counts.
 */
import type { Engine, Finding, ScanReport, Severity, Stip } from "@vidalo/core/types";
import { ENGINE_LABEL } from "@vidalo/core/types";
import type { CopyShape } from "@vidalo/core/copy";
import { findingSeverity } from "@vidalo/core/scanner";
import type { ReportRowData } from "@/components/ReportRow";
import type { SourceStatusTone } from "@/components/SourceRow";
import { questionFor, recommendationQuestionFor, wrongText, correctText } from "./questions";
import { hostOf } from "./format";

export type ReportState = "rood" | "groen" | "grijs";

export interface AnswerCardData {
  question: string;
  engine: string;
  before?: string;
  highlight: string;
  highlightTone: "rood" | "grijs" | "bold";
  after?: string;
  caption: string;
}

export interface SourceRowData {
  label: string;
  status: string;
  tone: SourceStatusTone;
  href?: string | null;
}

export interface PlanStep {
  tone: Stip;
  text: string;
}

export interface ReportView {
  state: ReportState;
  stip: Stip;
  questions: number;
  perQuestion: number;
  wrongQuestions: number;
  notFoundQuestions: number;
  hero: { number: number; label: readonly string[] };
  h1: string;
  intro: string;
  engineLines: { name: string; text: string }[];
  cards: AnswerCardData[];
  rows: ReportRowData[];
  /** Every answer, for the "Alle n antwoorden" list: question → engine → value. */
  all: { question: string; engine: string; value: string; tone: ReportRowData["tone"] }[];
  instable: { question: string; engine: string; value: string; note: string }[];
  sources: SourceRowData[];
  sourcesTitle: string;
  sourcesBody: string;
  plan: { h2: string; steps: PlanStep[]; note?: string; monitor: string; setup: string; excl: string };
  self: { h3: string; body: string; steps: string[] };
}

const severityRank: Record<Severity, number> = { afhaker: 0, misleider: 1, verwarring: 2 };

interface QuestionGroup {
  key: string;
  question: string;
  findings: Finding[];
  correct: { engine: Engine; value: string }[];
}

function keyOf(factKey: string, subject: string | null | undefined, rec = false): string {
  return `${factKey}:${subject ?? ""}${rec ? ":rec" : ""}`;
}

/** Group findings and correct answers into one row per question. */
function groupQuestions(report: ScanReport, copy: CopyShape): QuestionGroup[] {
  const { name, place } = report.business;
  const groups = new Map<string, QuestionGroup>();
  const get = (key: string, question: string) => {
    let g = groups.get(key);
    if (!g) {
      g = { key, question, findings: [], correct: [] };
      groups.set(key, g);
    }
    return g;
  };
  for (const c of report.correct) {
    const key = c.factKey ? keyOf(c.factKey, c.subject) : `p:${c.prompt}`;
    get(key, c.prompt).correct.push({ engine: c.engine, value: c.value });
  }
  for (const f of report.findings) {
    const rec = f.evidenceKind === "recommendation";
    const key = keyOf(f.factKey, f.subject, rec);
    const q = rec ? recommendationQuestionFor(f.factKey, f.subject, place, copy) : questionFor(f.factKey, f.subject, name, place);
    const g = groups.get(key) ?? get(key, q);
    g.findings.push(f);
  }
  // Findings first (worst first), then the correct ones, in a stable order.
  const rank = (g: QuestionGroup) => {
    const wrong = g.findings.filter((f) => f.verdict !== "not_found");
    if (wrong.length) return Math.min(...wrong.map((f) => severityRank[findingSeverity(f)]));
    if (g.findings.length) return 3;
    return 4;
  };
  return [...groups.values()].sort((a, b) => rank(a) - rank(b));
}

function sourceLabel(f: Finding, copy: CopyShape): { label: string; href: string | null } {
  const T = copy.result.table;
  if (f.verdict === "not_found") return { label: T.noSource, href: null };
  if (f.evidenceKind === "recommendation" && !f.sourceUrl) return { label: T.noSource, href: null };
  if (f.sourceUrl) {
    const host = hostOf(f.sourceUrl);
    return { label: f.sourceType === "other_entity" ? `${host}, ${T.otherEntity}` : host, href: f.sourceUrl };
  }
  if (f.sourceType === "other_entity") return { label: copy.sourceType.other_entity, href: null };
  if (f.sourceType === "none") return { label: T.memory, href: null };
  return { label: copy.sourceType[f.sourceType], href: null };
}

function dominant(findings: Finding[]): Finding | null {
  if (!findings.length) return null;
  return [...findings].sort((a, b) => severityRank[findingSeverity(a)] - severityRank[findingSeverity(b)] || b.frequency - a.frequency)[0]!;
}

function rowFor(g: QuestionGroup, copy: CopyShape): ReportRowData {
  const T = copy.result.table;
  const wrong = g.findings.filter((f) => f.verdict !== "not_found");
  const notFound = g.findings.filter((f) => f.verdict === "not_found");
  if (wrong.length) {
    const f = dominant(wrong)!;
    const rec = f.evidenceKind === "recommendation";
    const src = sourceLabel(f, copy);
    return {
      question: g.question,
      said: rec ? T.notNamed : wrongText(f),
      tone: "rood",
      correct: rec ? copy.recommendation.shouldName : f.sourceType === "other_entity" ? `${correctText(f)} (${T.otherEntity})` : correctText(f),
      source: src.label,
      sourceUrl: src.href,
      note: rec ? copy.recommendation.line : undefined,
    };
  }
  if (notFound.length) {
    const f = dominant(notFound)!;
    return { question: g.question, said: T.notFound, tone: "grijs", correct: correctText(f), source: T.noSource };
  }
  const value = g.correct[0]?.value ?? T.ok;
  return { question: g.question, said: value, tone: "groen", correct: T.ok, source: T.none };
}

function cardFor(f: Finding, business: ScanReport["business"], copy: CopyShape): AnswerCardData {
  const A = copy.result.answerCard;
  const question = f.evidenceKind === "recommendation" ? recommendationQuestionFor(f.factKey, f.subject, business.place, copy) : questionFor(f.factKey, f.subject, business.name, business.place);
  const engine = ENGINE_LABEL[f.engine];
  const caption = A.frequency(f.frequency, f.sampleCount) + (f.sourceType === "other_entity" ? ` · ${A.otherEntity}` : "");
  if (f.verdict === "not_found") return { question, engine, highlight: A.notFoundQuote, highlightTone: "grijs", caption };
  if (f.evidenceKind === "recommendation") return { question, engine, highlight: A.notNamed, highlightTone: "bold", caption };
  return { question, engine, highlight: wrongText(f), highlightTone: "rood", caption };
}

function pickCards(findings: Finding[], business: ScanReport["business"], grey: boolean, copy: CopyShape): AnswerCardData[] {
  const sorted = [...findings].sort((a, b) => severityRank[findingSeverity(a)] - severityRank[findingSeverity(b)] || b.frequency - a.frequency);
  if (!grey) {
    // One card per question: the worst finding of each question first.
    const seen = new Set<string>();
    const picks = sorted.filter((f) => {
      const k = keyOf(f.factKey, f.subject, f.evidenceKind === "recommendation");
      return seen.has(k) ? false : (seen.add(k), true);
    });
    return picks.slice(0, 3).map((f) => cardFor(f, business, copy));
  }
  // Grey: show the three kinds of "AI kent je niet" when they exist: not named, not found, another business.
  const picks: Finding[] = [];
  const add = (f: Finding | undefined) => f && !picks.includes(f) && picks.push(f);
  add(sorted.find((f) => f.evidenceKind === "recommendation"));
  add(sorted.find((f) => f.verdict === "not_found"));
  add(sorted.find((f) => f.sourceType === "other_entity"));
  for (const f of sorted) if (picks.length < 3) add(f);
  return picks.slice(0, 3).map((f) => cardFor(f, business, copy));
}

export interface BuildViewOptions {
  domain?: string | null;
  /** Pre-built source rows (grey state, when a source audit exists). */
  sources?: SourceRowData[];
  website?: string | null;
  googlePlaceId?: string | null;
  kvk?: string | null;
}

export function buildReportView(report: ScanReport, copy: CopyShape, opts: BuildViewOptions = {}): ReportView {
  const R = copy.result;
  const grey = report.visibility === "unknown" || report.stip === "grijs";
  const state: ReportState = grey ? "grijs" : report.stip === "groen" ? "groen" : "rood";
  const groups = groupQuestions(report, copy);
  const rows = groups.map((g) => rowFor(g, copy));
  const questions = rows.length;
  const wrongQuestions = rows.filter((r) => r.tone === "rood").length;
  const notFoundQuestions = rows.filter((r) => r.tone === "grijs").length;
  const activeEngines = report.engines.filter((e) => !e.skipped);
  const perQuestion = report.findings[0]?.sampleCount ?? (questions && activeEngines.length ? Math.max(1, Math.round(report.totalAnswers / (questions * activeEngines.length))) : 3);
  const engineNames = activeEngines.map((e) => ENGINE_LABEL[e.engine]);
  const enginesText = engineNames.length > 1 ? `${engineNames.slice(0, -1).join(", ")} en ${engineNames[engineNames.length - 1]}` : (engineNames[0] ?? "");

  const otherByEngine = new Map<Engine, number>();
  for (const f of report.findings) if (f.sourceType === "other_entity") otherByEngine.set(f.engine, (otherByEngine.get(f.engine) ?? 0) + f.frequency);
  const otherEntityTotal = [...otherByEngine.values()].reduce((a, b) => a + b, 0);

  const hero =
    state === "grijs"
      ? { number: rows.filter((r) => r.tone === "groen").length, label: R.hero.answeredLabel(questions) }
      : state === "groen"
        ? { number: questions, label: R.hero.okLabel(questions) }
        : { number: wrongQuestions, label: R.hero.wrongLabel(questions) };

  const h1 = state === "grijs" ? R.hero.h1Grey(report.business.name, report.business.place) : R.hero.h1(report.business.name, report.business.place, report.stip === "oranje" ? "oranje" : state === "groen" ? "groen" : "rood");
  const intro = state === "grijs" ? R.hero.introGrey(enginesText, questions, perQuestion, report.notFoundAnswers, report.totalAnswers, otherEntityTotal) : R.hero.intro(enginesText, questions, perQuestion, wrongQuestions, notFoundQuestions);

  const engineLines = report.engines.map((e) => {
    const other = otherByEngine.get(e.engine) ?? 0;
    return { name: ENGINE_LABEL[e.engine], text: e.skipped ? R.hero.engineSkipped : R.hero.engineCounts(e.correct, Math.max(0, e.wrong - other), e.notFound, other) };
  });

  const cards = pickCards(report.findings, report.business, grey, copy);

  const all = groups.flatMap((g) => {
    const row = rowFor(g, copy);
    const fromFindings = g.findings.map((f) => ({
      question: g.question,
      engine: ENGINE_LABEL[f.engine],
      value: f.verdict === "not_found" ? R.table.notFound : f.evidenceKind === "recommendation" ? R.table.notNamed : wrongText(f),
      tone: (f.verdict === "not_found" ? "grijs" : "rood") as ReportRowData["tone"],
    }));
    const fromCorrect = g.correct.map((c) => ({ question: g.question, engine: ENGINE_LABEL[c.engine], value: c.value, tone: "groen" as const }));
    return row ? [...fromFindings, ...fromCorrect] : [];
  });

  const instable = report.instable.map((f) => ({
    question: f.evidenceKind === "recommendation" ? recommendationQuestionFor(f.factKey, f.subject, report.business.place, copy) : questionFor(f.factKey, f.subject, report.business.name, report.business.place),
    engine: ENGINE_LABEL[f.engine],
    value: f.evidenceKind === "recommendation" ? R.table.notNamed : wrongText(f),
    note: copy.instableLine,
  }));

  // Sources
  let sources: SourceRowData[];
  if (opts.sources) sources = opts.sources;
  else if (state === "grijs") {
    const S = R.sources;
    sources = [
      { label: S.rows.website, status: opts.website ? S.known : S.missing, tone: opts.website ? "muted" : "rood", href: opts.website ?? null },
      { label: S.rows.gbp, status: opts.googlePlaceId ? S.known : S.unclaimed, tone: opts.googlePlaceId ? "muted" : "rood" },
      { label: S.rows.bingApple, status: S.unchecked, tone: "muted" },
      { label: S.rows.directories(13), status: S.unchecked, tone: "muted" },
      { label: S.rows.kvk, status: opts.kvk ? S.ok : S.unchecked, tone: opts.kvk ? "groen" : "muted" },
    ];
  } else {
    const bySource = new Map<string, { label: string; href: string | null; n: number }>();
    for (const f of report.findings) {
      if (f.verdict === "not_found") continue;
      const src = sourceLabel(f, copy);
      const k = src.href ?? src.label;
      const cur = bySource.get(k) ?? { label: src.label, href: src.href, n: 0 };
      cur.n += 1;
      bySource.set(k, cur);
    }
    sources = [...bySource.values()].map((s) => ({ label: s.label, href: s.href, status: R.sources.wrongCount(s.n), tone: "rood" as const }));
  }

  // Plan
  const hosts = [...new Set(report.findings.filter((f) => f.verdict !== "not_found" && f.sourceUrl && f.sourceType !== "owned_website" && f.sourceType !== "owned_facts_page").map((f) => hostOf(f.sourceUrl)))];
  const firstTone: Stip = state === "grijs" ? "grijs" : state === "groen" ? "grijs" : report.stip === "oranje" ? "oranje" : "rood";
  const plan =
    state === "grijs"
      ? {
          h2: R.plan.h2Grey,
          steps: [
            { tone: "grijs" as const, text: R.plan.stepsGrey.facts },
            { tone: "oranje" as const, text: R.plan.stepsGrey.publish(opts.domain ?? null) },
            { tone: "groen" as const, text: R.plan.stepsGrey.recheck(questions) },
          ],
          note: R.plan.noteGrey,
          monitor: R.plan.monitorGrey,
          setup: R.plan.setupGrey,
          excl: R.plan.exclVatGrey,
        }
      : state === "groen"
        ? {
            h2: R.plan.h2Green,
            steps: R.plan.stepsGreen.map((text, i) => ({ tone: (["grijs", "oranje", "groen"] as const)[i]!, text })),
            monitor: R.plan.monitor,
            setup: R.plan.setup,
            excl: R.plan.exclVat,
          }
        : {
            h2: R.plan.h2,
            steps: [
              { tone: firstTone, text: hosts.length ? R.plan.stepSources(hosts.join(", ")) : R.plan.stepSourcesNone },
              { tone: "oranje" as const, text: R.plan.stepFacts(opts.domain ?? null) },
              { tone: "groen" as const, text: R.plan.stepRecheck(14, questions) },
            ],
            monitor: R.plan.monitor,
            setup: R.plan.setup,
            excl: R.plan.exclVat,
          };

  const selfSteps =
    state === "grijs"
      ? [...R.self.stepsGrey]
      : report.findings
          .filter((f) => f.verdict !== "not_found")
          .map((f) => {
            const src = sourceLabel(f, copy);
            return `${src.label}: ${ENGINE_LABEL[f.engine]} ${copy.findingVerdict.wrong.toLowerCase()} “${f.evidenceKind === "recommendation" ? R.table.notNamed : wrongText(f)}”, het is ${correctText(f)}. ${f.verdict === "wrong" ? copy.fixPath[f.sourceType] : ""}`.trim();
          });

  return {
    state,
    stip: report.stip,
    questions,
    perQuestion,
    wrongQuestions,
    notFoundQuestions,
    hero,
    h1,
    intro,
    engineLines,
    cards,
    rows,
    all,
    instable,
    sources,
    sourcesTitle: state === "grijs" ? R.sources.h2Grey : R.sources.h2,
    sourcesBody: state === "grijs" ? R.sources.bodyGrey : R.sources.body,
    plan,
    self: { h3: state === "grijs" ? R.self.h3Grey : R.self.h3, body: state === "grijs" ? R.self.bodyGrey : R.self.body, steps: selfSteps },
  };
}
