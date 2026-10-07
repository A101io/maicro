import { describe, expect, it } from "vitest";
import { freeScanPrompts, generatePrompts, mostUnusualDay, selectFreeScanPrompts } from "../src/prompts";
import { sampleFacts } from "./scanner-fixtures";

describe("generatePrompts", () => {
  it("produces 20 prompts with the expected category mix", () => {
    const prompts = generatePrompts(sampleFacts());
    expect(prompts).toHaveLength(20);
    const count = (c: string) => prompts.filter((p) => p.category === c).length;
    expect(count("existence")).toBe(3);
    expect(count("hours")).toBe(4);
    expect(count("phone")).toBe(2);
    expect(count("address")).toBe(1);
    expect(count("website")).toBe(1);
    expect(count("service")).toBe(4);
    expect(count("price")).toBe(2);
    expect(count("policy")).toBe(2);
    expect(count("payment")).toBe(1);
  });

  it("names the probed fact field for every prompt", () => {
    const prompts = generatePrompts(sampleFacts());
    for (const p of prompts) expect(p.probes.length).toBeGreaterThan(0);
    expect(prompts.find((p) => p.textNl.includes("op zondag"))?.probes).toEqual(["hours.6"]);
    expect(prompts.filter((p) => p.category === "service").map((p) => p.probes[0])).toEqual([
      "service:taarten op bestelling",
      "service:glutenvrij brood",
      "service:bezorgen",
      "service:catering",
    ]);
    expect(prompts.find((p) => p.category === "payment")?.textNl).toBe("Kan ik bij Bakkerij De Vries in Haarlem pinnen?");
    expect(prompts.find((p) => p.category === "payment")?.probes).toEqual(["payment:pin"]);
  });

  it("probes the day with the most unusual hours (Friday evening here)", () => {
    const facts = sampleFacts();
    expect(mostUnusualDay(facts.hours)).toBe(4);
    const prompts = generatePrompts(facts);
    expect(prompts.some((p) => p.textNl.includes("op vrijdag") && p.probes.includes("hours.4"))).toBe(true);
  });

  it("skips price and policy prompts when facts have none", () => {
    const prompts = generatePrompts(sampleFacts({ prices: [], policies: [] }));
    expect(prompts).toHaveLength(16);
  });
});

describe("freeScanPrompts", () => {
  it("returns the 6 most valuable prompts", () => {
    const free = freeScanPrompts(sampleFacts());
    expect(free).toHaveLength(6);
    expect(free.map((p) => p.category)).toEqual(["existence", "hours", "phone", "address", "service", "payment"]);
    expect(free[1]!.probes).toEqual(["hours.6"]);
    expect(free[4]!.probes).toEqual(["service:bezorgen"]); // a servicesNo entry
  });

  it("is a subset of the full prompt set so stored prompts can be selected", () => {
    const facts = sampleFacts();
    const all = generatePrompts(facts).map((p, i) => ({ ...p, id: String(i) }));
    expect(selectFreeScanPrompts(all, facts)).toHaveLength(6);
  });
});
