/**
 * Compare extracted claims with the owner facts and aggregate per
 * (factKey, subject, engine) into finding candidates.
 *
 * Thresholds (ARCHITECTURE.md): wrong when >= 30% of samples disagree;
 * unstable between 10% and 30%; for phone / address / existence a single
 * disagreeing sample is already a finding (the frequency tells the story).
 *
 * Not found: a sample whose extractor emitted the not-found sentinel counts
 * as "the engine knows nothing about this business" for every probe of that
 * prompt. When >= 50% of a group's samples are not found, the group gets a
 * finding with verdict "not_found". Not-found samples are never wrong and
 * never correct.
 */
import type { Claim, Engine, FactKey, Facts, SourceType, Verdict } from "../types";
import { NOT_FOUND_LABEL } from "../types";
import { isNotFoundClaim, parseProbe, type PromptLike } from "./extract";
import { describeValue, factValue, valuesMatch } from "./normalize";

export const WRONG_THRESHOLD = 0.3;
export const UNSTABLE_THRESHOLD = 0.1;
/** One disagreeing sample is enough for these keys. */
export const STRICT_KEYS: FactKey[] = ["phone", "address", "existence"];
/** Share of a group's samples that must say "not found" before it becomes a not_found finding. */
export const NOT_FOUND_THRESHOLD = 0.5;

export interface ComparableSample {
  sampleId: string;
  engine: Engine;
  prompt: PromptLike;
  claims: Claim[];
  citations: string[];
}

/** A finding before it is attributed and persisted. */
export interface FindingCandidate {
  factKey: FactKey;
  subject: string | null;
  engine: Engine;
  verdict: Exclude<Verdict, "correct">;
  wrongValue: string;
  correctValue: string;
  frequency: number;
  sampleCount: number;
  /** Sample ids that carried the wrong value (or said not found), first = evidenceBefore. */
  wrongSampleIds: string[];
  /** Citations of the wrong samples, in order, de-duplicated. */
  citations: string[];
  /** Pre-classified when the claims were about another business, or "none" for a not_found finding. */
  sourceType?: Extract<SourceType, "other_entity" | "none">;
  /** Raw quotes carrying the wrong value (for attribution / display). */
  quotes: string[];
}

export type SampleVerdict = "correct" | "wrong" | "unknown" | "other_entity" | "not_found";

export interface CompareResult {
  findings: FindingCandidate[];
  unstable: FindingCandidate[];
  correct: { prompt: string; engine: Engine; value: string; sampleId: string }[];
  verdicts: Map<string, SampleVerdict>;
  /** (factKey|subject|engine) keys that were actually checked in this run. */
  checkedKeys: Set<string>;
}

export const groupKey = (factKey: FactKey, subject: string | null, engine: Engine) => `${factKey}|${subject ?? ""}|${engine}`;

export function compare(samples: ComparableSample[], facts: Facts): CompareResult {
  interface Group {
    factKey: FactKey;
    subject: string | null;
    engine: Engine;
    expected: string;
    samples: { sampleId: string; claim: Claim | null; citations: string[] }[];
  }
  const groups = new Map<string, Group>();
  const verdicts = new Map<string, SampleVerdict>();
  const wrongSamples = new Set<string>();
  const judgedSamples = new Set<string>();
  const otherEntitySamples = new Set<string>();
  const notFoundSamples = new Set<string>();
  const correct: CompareResult["correct"] = [];

  for (const s of samples) {
    if (s.claims.some(isNotFoundClaim)) notFoundSamples.add(s.sampleId);
    const probes = s.prompt.probes.length ? s.prompt.probes : [s.prompt.category];
    for (const probe of probes) {
      const { factKey, subject } = parseProbe(probe);
      const expected = factValue(facts, factKey, subject);
      if (expected == null) continue; // nothing to check this probe against
      const key = groupKey(factKey, subject, s.engine);
      let g = groups.get(key);
      if (!g) {
        g = { factKey, subject, engine: s.engine, expected, samples: [] };
        groups.set(key, g);
      }
      const claim = s.claims.find((c) => c.factKey === factKey && (c.subject ?? null) === subject) ?? null;
      g.samples.push({ sampleId: s.sampleId, claim, citations: s.citations });
    }
  }

  const findings: FindingCandidate[] = [];
  const unstable: FindingCandidate[] = [];
  const checkedKeys = new Set<string>();

  for (const g of groups.values()) {
    checkedKeys.add(groupKey(g.factKey, g.subject, g.engine));
    const wrong: { sampleId: string; value: string; citations: string[]; quote: string }[] = [];
    const other: { sampleId: string; value: string; citations: string[]; quote: string }[] = [];
    const notFound: { sampleId: string; value: string; citations: string[]; quote: string }[] = [];
    for (const s of g.samples) {
      if (notFoundSamples.has(s.sampleId)) {
        const quote = samples.find((x) => x.sampleId === s.sampleId)?.claims.find(isNotFoundClaim)?.rawQuote ?? "";
        notFound.push({ sampleId: s.sampleId, value: NOT_FOUND_LABEL, citations: [], quote });
        continue;
      }
      if (!s.claim) continue;
      judgedSamples.add(s.sampleId);
      if (s.claim.otherEntity) {
        other.push({ sampleId: s.sampleId, value: s.claim.value, citations: s.citations, quote: s.claim.rawQuote });
        otherEntitySamples.add(s.sampleId);
        continue;
      }
      if (valuesMatch(g.factKey, s.claim.value, g.expected)) {
        if (!wrongSamples.has(s.sampleId)) {
          const promptText = samples.find((x) => x.sampleId === s.sampleId)?.prompt.textNl ?? "";
          correct.push({ prompt: promptText, engine: g.engine, value: describeValue(g.factKey, s.claim.value, g.subject), sampleId: s.sampleId });
        }
      } else {
        wrong.push({ sampleId: s.sampleId, value: s.claim.value, citations: s.citations, quote: s.claim.rawQuote });
        wrongSamples.add(s.sampleId);
      }
    }

    const sampleCount = g.samples.length;
    const build = (list: typeof wrong, sourceType?: "other_entity" | "none", verdict: FindingCandidate["verdict"] = "wrong"): FindingCandidate => {
      // Dominant wrong value.
      const counts = new Map<string, number>();
      for (const w of list) counts.set(w.value, (counts.get(w.value) ?? 0) + 1);
      const wrongValue = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
      const carriers = list.filter((w) => w.value === wrongValue);
      return {
        factKey: g.factKey,
        subject: g.subject,
        engine: g.engine,
        verdict,
        wrongValue,
        correctValue: g.expected,
        frequency: list.length,
        sampleCount,
        wrongSampleIds: carriers.map((w) => w.sampleId),
        citations: [...new Set(carriers.flatMap((w) => w.citations))],
        quotes: carriers.map((w) => w.quote).filter(Boolean),
        ...(sourceType ? { sourceType } : {}),
      };
    };

    // Not found is its own finding next to a possible wrong one (different verdict, same key).
    if (notFound.length && notFound.length / sampleCount >= NOT_FOUND_THRESHOLD) findings.push(build(notFound, "none", "not_found"));

    // One wrong candidate per (factKey, subject, engine): a wrong value beats an other-entity answer.
    let pushed = false;
    if (wrong.length) {
      const ratio = wrong.length / sampleCount;
      const strict = STRICT_KEYS.includes(g.factKey);
      if (strict || ratio >= WRONG_THRESHOLD) {
        findings.push(build(wrong));
        pushed = true;
      } else if (ratio >= UNSTABLE_THRESHOLD) unstable.push(build(wrong));
    }
    if (other.length && !pushed) findings.push(build(other, "other_entity"));
  }

  // Remove "correct" entries for samples that turned out wrong on another probe.
  const cleanCorrect = correct.filter((c) => !wrongSamples.has(c.sampleId) && !otherEntitySamples.has(c.sampleId));
  for (const s of samples) {
    if (notFoundSamples.has(s.sampleId)) verdicts.set(s.sampleId, "not_found");
    else if (wrongSamples.has(s.sampleId)) verdicts.set(s.sampleId, "wrong");
    else if (otherEntitySamples.has(s.sampleId)) verdicts.set(s.sampleId, "other_entity");
    else if (judgedSamples.has(s.sampleId)) verdicts.set(s.sampleId, "correct");
    else verdicts.set(s.sampleId, "unknown");
  }

  return { findings, unstable, correct: cleanCorrect, verdicts, checkedKeys };
}
