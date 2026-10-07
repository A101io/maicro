import { describe, expect, it } from "vitest";
import type { Claim, Engine } from "../src/types";
import { NOT_FOUND_LABEL, NOT_FOUND_VALUE, visibilityFor } from "../src/types";
import { compare, type ComparableSample } from "../src/scanner/compare";
import { extractClaimsRules, isNotFoundClaim, looksNotFound, notFoundClaim } from "../src/scanner/extract";
import { factValue, normalizePhone, valuesMatch } from "../src/scanner/normalize";
import { sampleFacts } from "./scanner-fixtures";

const facts = sampleFacts();

function claim(factKey: Claim["factKey"], subject: string | null, value: string, otherEntity = false): Claim {
  return { sampleId: "", factKey, subject, value, confidence: 0.8, otherEntity, rawQuote: value };
}

function samples(engine: Engine, probe: string, values: (string | null)[], opts: { otherEntity?: boolean; citations?: string[] } = {}): ComparableSample[] {
  const [factKey, subject] = probe.includes(".") ? probe.split(".") : probe.includes(":") ? probe.split(":") : [probe, null];
  return values.map((v, i) => ({
    sampleId: `${engine}-${probe}-${i}`,
    engine,
    prompt: { category: factKey as Claim["factKey"], probes: [probe], textNl: `vraag ${probe}` },
    claims: v == null ? [] : [{ ...claim(factKey as Claim["factKey"], subject ?? null, v, opts.otherEntity), sampleId: `${engine}-${probe}-${i}` }],
    citations: opts.citations ?? [],
  }));
}

describe("normalisation", () => {
  it("normalises Dutch phone notations", () => {
    expect(normalizePhone("023-5312345")).toBe("+31235312345");
    expect(normalizePhone("+31 (0)23 531 23 45")).toBe("+31235312345");
    expect(normalizePhone("0031235312345")).toBe("+31235312345");
    expect(normalizePhone("06 12345678")).toBe("+31612345678");
    expect(normalizePhone("12345")).toBeNull();
  });

  it("maps facts into the claim value space", () => {
    expect(factValue(facts, "hours", "6")).toBe("closed");
    expect(factValue(facts, "hours", "4")).toBe("08:00-20:00");
    expect(factValue(facts, "phone", null)).toBe("+31235312345");
    expect(factValue(facts, "service", "bezorgen")).toBe("no");
    expect(factValue(facts, "service", "Glutenvrij brood")).toBe("yes");
    expect(factValue(facts, "service", "onbekend")).toBeNull();
    expect(factValue(facts, "payment", "pin")).toBe("yes");
    expect(factValue(facts, "price", "een brood")).toBe("3.95");
    expect(factValue(facts, "website", null)).toBe("bakkerijdevries.nl");
  });

  it("matches addresses on street + number and prices within 1%", () => {
    expect(valuesMatch("address", "grote houtstraat 12 haarlem", "grote houtstraat 12 2011sm haarlem")).toBe(true);
    expect(valuesMatch("address", "grote houtstraat 14 2011sm haarlem", "grote houtstraat 12 2011sm haarlem")).toBe(false);
    expect(valuesMatch("price", "3.95", "3.95")).toBe(true);
    expect(valuesMatch("price", "4.95", "3.95")).toBe(false);
  });
});

describe("compare thresholds", () => {
  it("flags hours wrong at >= 30% and unstable between 10% and 30%", () => {
    const wrong = compare(samples("chatgpt", "hours.6", ["10:00-16:00", "10:00-16:00", "10:00-16:00", "closed", "closed", "closed", "closed", "closed", "closed", "closed"]), facts);
    expect(wrong.findings).toHaveLength(1);
    expect(wrong.findings[0]).toMatchObject({ factKey: "hours", subject: "6", engine: "chatgpt", wrongValue: "10:00-16:00", correctValue: "closed", frequency: 3, sampleCount: 10 });

    const unstable = compare(samples("chatgpt", "hours.6", ["10:00-16:00", ...Array(9).fill("closed")]), facts);
    expect(unstable.findings).toHaveLength(0);
    expect(unstable.unstable).toHaveLength(1);
    expect(unstable.unstable[0]!.frequency).toBe(1);
  });

  it("flags phone, address and existence on a single wrong sample", () => {
    const phone = compare(samples("gemini", "phone", ["+31235312345", "+31235312345", "+31235399999"]), facts);
    expect(phone.findings).toHaveLength(1);
    expect(phone.findings[0]).toMatchObject({ factKey: "phone", wrongValue: "+31235399999", frequency: 1, sampleCount: 3 });

    const existence = compare(samples("perplexity", "existence", ["open", "permanently_closed", "open", "open", "open", "open", "open", "open", "open", "open"]), facts);
    expect(existence.findings).toHaveLength(1);
    expect(existence.findings[0]!.wrongValue).toBe("permanently_closed");
  });

  it("does not report anything when the facts do not know the value", () => {
    const r = compare(samples("chatgpt", "service:onbekend", ["yes", "yes", "yes"]), facts);
    expect(r.findings).toHaveLength(0);
    expect(r.checkedKeys.size).toBe(0);
  });

  it("buckets otherEntity claims as other_entity findings and keeps per-sample verdicts", () => {
    const r = compare(samples("copilot", "phone", ["+31201234567", "+31235312345"], { otherEntity: true }), facts);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]!.sourceType).toBe("other_entity");
    expect(r.verdicts.get("copilot-phone-0")).toBe("other_entity");
  });

  it("lists correct answers and uses the dominant wrong value", () => {
    const r = compare(samples("chatgpt", "service:bezorgen", ["no", "yes", "yes", "no", "yes", null]), facts);
    expect(r.findings[0]).toMatchObject({ wrongValue: "yes", frequency: 3, sampleCount: 6 });
    expect(r.correct).toHaveLength(2);
    expect(r.correct[0]!.value).toBe("nee");
    expect(r.verdicts.get("chatgpt-service:bezorgen-5")).toBe("unknown");
  });
});

describe("not found", () => {
  const nf = (engine: Engine, probe: string, i: number): ComparableSample => {
    const [factKey] = probe.includes(".") ? probe.split(".") : probe.includes(":") ? probe.split(":") : [probe];
    const prompt = { category: factKey as Claim["factKey"], probes: [probe], textNl: `vraag ${probe}` };
    return { sampleId: `${engine}-${probe}-${i}`, engine, prompt, claims: [notFoundClaim(prompt, `${engine}-${probe}-${i}`)], citations: [] };
  };

  it("becomes a not_found finding at >= 50% of the samples, never a wrong one", () => {
    const ok = samples("chatgpt", "hours.6", ["closed", "closed", "closed", "closed", "closed", "closed", "closed", "closed", "closed", "closed"]);
    const mixed = ok.map((s, i) => (i < 5 ? nf("chatgpt", "hours.6", i) : s));
    const r = compare(mixed, facts);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]).toMatchObject({ verdict: "not_found", wrongValue: NOT_FOUND_LABEL, correctValue: "closed", frequency: 5, sampleCount: 10, sourceType: "none" });
    expect(r.findings[0]!.citations).toEqual([]);
    expect(r.verdicts.get("chatgpt-hours.6-0")).toBe("not_found");
    expect(r.verdicts.get("chatgpt-hours.6-9")).toBe("correct");
    expect(r.correct).toHaveLength(5);

    const below = ok.map((s, i) => (i < 4 ? nf("chatgpt", "hours.6", i) : s));
    expect(compare(below, facts).findings).toHaveLength(0);
    expect([...compare(below, facts).verdicts.values()].filter((v) => v === "not_found")).toHaveLength(4);
  });

  it("keeps a wrong finding next to a not_found one for the same key", () => {
    const base = samples("gemini", "phone", ["+31235399999", "+31235312345", "+31235312345", "+31235312345"]);
    const mixed = [nf("gemini", "phone", 10), nf("gemini", "phone", 11), nf("gemini", "phone", 12), nf("gemini", "phone", 13), ...base];
    const r = compare(mixed, facts);
    expect(r.findings.map((f) => f.verdict).sort()).toEqual(["not_found", "wrong"]);
    expect(r.findings.find((f) => f.verdict === "wrong")!.frequency).toBe(1);
    expect(r.findings.find((f) => f.verdict === "not_found")!.frequency).toBe(4);
  });

  it("visibility follows the share of not-found answers", () => {
    expect(visibilityFor(100, 60)).toBe("unknown");
    expect(visibilityFor(100, 59)).toBe("partial");
    expect(visibilityFor(100, 25)).toBe("partial");
    expect(visibilityFor(100, 24)).toBe("found");
    expect(visibilityFor(0, 0)).toBe("found");
  });

  it("detects Dutch and English 'no information' answers, not 'bestaat niet meer'", () => {
    for (const t of [
      "Ik kan geen informatie vinden over Polyvale Nieuw in Haarlem.",
      "Dat kan ik niet vinden.",
      "Ik kon geen telefoonnummer vinden van dit bedrijf.",
      "Het telefoonnummer is mij niet bekend.",
      "I couldn't find anything about this business.",
      "There is no information available about Polyvale.",
      "I don't have information on that company.",
      "Dit bedrijf ken ik niet.",
      "Er zijn geen gegevens over dit bedrijf.",
      "Polyvale Nieuw bestaat mogelijk niet.",
      "Dit bedrijf bestaat niet.",
    ]) {
      expect(looksNotFound(t), t).toBe(true);
    }
    expect(looksNotFound("Bakkerij De Vries bestaat niet meer; de zaak is gestopt.")).toBe(false);
    expect(looksNotFound("Nee, Bakkerij De Vries biedt geen bezorgen aan.")).toBe(false);
    expect(looksNotFound("Je bereikt Bakkerij De Vries op 023-5312345.")).toBe(false);
  });

  it("rules extractor returns only the sentinel claim for a not-found answer", () => {
    const prompt = { category: "phone" as const, probes: ["phone"], textNl: "Wat is het telefoonnummer?" };
    const claims = extractClaimsRules("Ik kan geen informatie vinden over Polyvale Nieuw in Haarlem. Bel 023-5312345 niet.", facts, prompt, "s1");
    expect(claims).toHaveLength(1);
    expect(claims[0]).toMatchObject({ sampleId: "s1", factKey: "phone", subject: null, value: NOT_FOUND_VALUE, otherEntity: false });
    expect(isNotFoundClaim(claims[0]!)).toBe(true);
    const closed = extractClaimsRules("Bakkerij De Vries in Haarlem bestaat niet meer.", facts, { category: "existence", probes: ["existence"], textNl: "" });
    expect(closed[0]!.value).toBe("permanently_closed");
  });
});

describe("rule-based extraction", () => {
  const prompt = (category: Claim["factKey"], probe: string, textNl = "") => ({ category, probes: [probe], textNl });

  it("extracts normalised phone, hours, existence and yes/no claims", () => {
    expect(extractClaimsRules("Je bereikt Bakkerij De Vries op 023-5399999.", facts, prompt("phone", "phone"))[0]).toMatchObject({ factKey: "phone", value: "+31235399999" });
    expect(extractClaimsRules("Bakkerij De Vries is op zondag open van 10:00 tot 16:00.", facts, prompt("hours", "hours.6"))[0]).toMatchObject({ factKey: "hours", subject: "6", value: "10:00-16:00" });
    expect(extractClaimsRules("Bakkerij De Vries in Haarlem is op zondag gesloten.", facts, prompt("hours", "hours.6"))[0]!.value).toBe("closed");
    expect(extractClaimsRules("Bakkerij De Vries in Haarlem is permanent gesloten.", facts, prompt("existence", "existence"))[0]!.value).toBe("permanently_closed");
    expect(extractClaimsRules("Nee, dat is niet het geval.", facts, prompt("existence", "existence", "Is Bakkerij De Vries in Haarlem permanent gesloten?"))[0]!.value).toBe("open");
    expect(extractClaimsRules("Nee, Bakkerij De Vries biedt geen bezorgen aan.", facts, prompt("service", "service:bezorgen"))[0]).toMatchObject({ subject: "bezorgen", value: "no" });
    expect(extractClaimsRules("Ja, je kunt er gewoon pinnen.", facts, prompt("payment", "payment:pin"))[0]!.value).toBe("yes");
    expect(extractClaimsRules("Een brood kost € 3,95.", facts, prompt("price", "price:een brood"))[0]!.value).toBe("3.95");
  });

  it("extracts an address and marks other-entity answers", () => {
    const a = extractClaimsRules("Het adres is Grote Houtstraat 14, 2011 SM Haarlem.", facts, prompt("address", "address"))[0]!;
    expect(a.value).toBe("grote houtstraat 14 2011sm haarlem");
    expect(a.otherEntity).toBe(false);
    const other = extractClaimsRules("Bakkerij De Vries in Amsterdam is op zondag gesloten.", facts, prompt("hours", "hours.6"))[0]!;
    expect(other.otherEntity).toBe(true);
  });

  it("extracts every day from a general opening-hours answer", () => {
    const text = "De openingstijden zijn: op maandag open van 08:00 tot 18:00, op vrijdag open van 08:00 tot 20:00, op zondag gesloten.";
    const claims = extractClaimsRules(text, facts, { category: "hours", probes: ["hours.0", "hours.4", "hours.6"], textNl: "" });
    expect(claims.map((c) => [c.subject, c.value])).toEqual([["0", "08:00-18:00"], ["4", "08:00-20:00"], ["6", "closed"]]);
  });
});
