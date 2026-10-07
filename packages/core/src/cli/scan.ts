/**
 * CLI: run a scan for one business or a CSV list of businesses.
 *
 *   pnpm scan --name "Bakkerij De Vries" --place Haarlem [--kind free|baseline|monthly] \
 *             [--engines chatgpt,gemini] [--samples 3] [--json out.json] [--verbose]
 *   pnpm scan --list businesses.csv [--kind free] [--out out/scans]
 *
 * The CSV has one "name,place" per line (header optional). For every business a
 * JSON report and a Dutch markdown summary are written to out/scans/.
 *
 * MAICRO_MOCK=1 runs everything offline with deterministic synthetic answers.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ENGINE_LABEL, ENGINES, type Engine, type Finding, type ScanKind, type ScanReport } from "../types";
import { db } from "../db";
import { prepareBusiness } from "../scanner/onboard";
import { runScan } from "../scanner";
import { describeFact, describeValue } from "../scanner/normalize";

interface Args {
  name?: string;
  place?: string;
  list?: string;
  kind: ScanKind;
  engines?: Engine[];
  samples?: number;
  json?: string;
  out: string;
  verbose: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { kind: "free", out: "out/scans", verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    const next = () => argv[++i];
    switch (a) {
      case "--name":
        args.name = next();
        break;
      case "--place":
        args.place = next();
        break;
      case "--list":
        args.list = next();
        break;
      case "--kind":
        args.kind = next() as ScanKind;
        break;
      case "--engines":
        args.engines = (next() ?? "").split(",").map((s) => s.trim()).filter((s): s is Engine => (ENGINES as string[]).includes(s));
        break;
      case "--samples":
        args.samples = Number(next());
        break;
      case "--json":
        args.json = next();
        break;
      case "--out":
        args.out = next() ?? args.out;
        break;
      case "--verbose":
      case "-v":
        args.verbose = true;
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
    }
  }
  return args;
}

function printUsage(): void {
  console.log(`Gebruik:
  pnpm scan --name "Bakkerij De Vries" --place Haarlem [--kind free|baseline|monthly] [--engines chatgpt,gemini] [--samples 3] [--json out.json]
  pnpm scan --list businesses.csv [--kind free] [--out out/scans]

Zet MAICRO_MOCK=1 om zonder API-sleutels te draaien.`);
}

const SOURCE_LABEL: Record<Finding["sourceType"], string> = {
  owned_facts_page: "je feitenpagina",
  owned_website: "je eigen website",
  directory_api: "een bedrijvenprofiel (Google/Bing/Apple)",
  directory_form: "een bedrijvengids",
  third_party: "een andere website",
  other_entity: "een ander bedrijf met dezelfde naam",
  none: "het geheugen van het AI-model (geen bron)",
};

const VISIBILITY_LABEL: Record<ScanReport["visibility"], string> = {
  found: "AI kent dit bedrijf.",
  partial: "AI kent dit bedrijf maar half: een deel van de antwoorden is leeg.",
  unknown: "AI vindt (bijna) niets over dit bedrijf. Het bestaat niet in het antwoord.",
};

/** Readable Dutch summary of a scan, e.g. "4 van 18 antwoorden kloppen niet". */
export function summarizeNl(report: ScanReport): string {
  const lines: string[] = [];
  const { business, totalAnswers, wrongAnswers, notFoundAnswers = 0, visibility = "found" } = report;
  lines.push(`${business.name} (${business.place})`);
  const headline = [`${wrongAnswers} van ${totalAnswers} antwoorden ${wrongAnswers === 1 ? "klopt" : "kloppen"} niet.`];
  if (notFoundAnswers) headline.push(`${notFoundAnswers} ${notFoundAnswers === 1 ? "antwoord" : "antwoorden"}: niet gevonden.`);
  if (visibility !== "found") headline.push(VISIBILITY_LABEL[visibility]);
  lines.push(headline.join(" "));
  const perEngine = report.engines
    .map((e) =>
      e.skipped
        ? `${ENGINE_LABEL[e.engine]}: niet gecontroleerd`
        : `${ENGINE_LABEL[e.engine]}: ${e.wrong} fout, ${e.correct} goed${e.notFound ? `, ? ${e.notFound} niet gevonden` : ""}`,
    )
    .join(" · ");
  lines.push(perEngine);
  if (report.findings.length) {
    lines.push("");
    lines.push("Wat er fout gaat:");
    for (const f of report.findings) {
      const what = describeFact(f.factKey, f.subject);
      if (f.verdict === "not_found") {
        lines.push(`- ${ENGINE_LABEL[f.engine]} vindt niets over ${what} van ${business.name} in ${business.place} (${f.frequency} van ${f.sampleCount} keer). Niet gevonden: we maken je vindbaar.`);
        continue;
      }
      if (f.sourceType === "other_entity") {
        const src = f.sourceUrl ? ` Bron: ${f.sourceUrl}.` : "";
        lines.push(`- ${ENGINE_LABEL[f.engine]} haalt ${business.name} in ${business.place} door elkaar met een ander bedrijf met dezelfde naam bij ${what} (${f.frequency} van ${f.sampleCount} keer).${src}`);
        continue;
      }
      const wrong = describeValue(f.factKey, f.wrongValue, f.subject);
      const right = describeValue(f.factKey, f.correctValue, f.subject);
      const freq = `${f.frequency} van ${f.sampleCount} keer`;
      const src = f.sourceUrl ? `${SOURCE_LABEL[f.sourceType]} (${f.sourceUrl})` : SOURCE_LABEL[f.sourceType];
      const status = f.status === "open" ? "" : ` [${f.status}]`;
      lines.push(`- ${ENGINE_LABEL[f.engine]} zegt over ${what}: "${wrong}" (${freq}); juist is "${right}". Bron: ${src}.${status}`);
    }
  } else {
    lines.push("");
    lines.push("Alles wat we controleerden klopt.");
  }
  if (report.correct.length) {
    lines.push("");
    lines.push(`Wat klopt (${report.correct.length} antwoorden), bijvoorbeeld:`);
    const seen = new Set<string>();
    const unique = report.correct.filter((c) => {
      const k = `${c.engine}|${c.prompt}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    for (const c of unique.slice(0, 5)) lines.push(`- ${ENGINE_LABEL[c.engine]}: "${c.prompt}" → ${c.value}`);
  }
  return lines.join("\n");
}

/** Markdown version of the summary for out/scans/{slug}.md. */
export function markdownNl(report: ScanReport): string {
  const when = new Date(report.checkedAt).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" });
  const [, headline, perEngine, ...rest] = summarizeNl(report).split("\n");
  const lines = [`# ${report.business.name} – ${report.business.place}`, "", `Gecontroleerd op ${when}.`, "", `**${headline}**`, "", perEngine ?? "", ""];
  for (const l of rest) lines.push(l.startsWith("- ") || !l ? l : `**${l}**`);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}

async function scanOne(name: string, place: string, args: Args): Promise<ScanReport> {
  const prepared = await prepareBusiness({ name, place, db });
  if (args.verbose) {
    console.log(`[${prepared.business.slug}] ${prepared.created ? "nieuw" : "bestaand"} bedrijf, feiten v${prepared.factsVersion}, ${prepared.prompts.length} vragen`);
  }
  return runScan({
    businessId: prepared.business.id,
    kind: args.kind,
    engines: args.engines,
    samplesPerPrompt: args.samples,
    db,
    onProgress: args.verbose
      ? (ev) => {
          if (ev.type === "asked") console.log(`  [${ev.done}/${ev.total}] ${ENGINE_LABEL[ev.engine]} ← "${ev.prompt}" ${ev.ok ? "" : "(geen antwoord)"}`);
          else if (ev.type === "phase") console.log(`  … ${ev.phase}`);
        }
      : undefined,
  });
}

async function readList(file: string): Promise<{ name: string; place: string }[]> {
  const text = await readFile(file, "utf8");
  const rows: { name: string; place: string }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [name, place] = line.split(/[,;]\s*/).map((s) => s.replace(/^"|"$/g, "").trim());
    if (!name || !place || (name.toLowerCase() === "name" && place.toLowerCase() === "place")) continue;
    rows.push({ name, place });
  }
  return rows;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (process.env.MAICRO_MOCK === "1") console.log("(mock-modus: synthetische antwoorden, geen API-aanroepen)\n");

  if (args.list) {
    const rows = await readList(args.list);
    await mkdir(args.out, { recursive: true });
    const totals = { businesses: 0, answers: 0, wrong: 0, findings: 0 };
    for (const row of rows) {
      try {
        const report = await scanOne(row.name, row.place, args);
        const base = path.join(args.out, report.business.slug);
        await writeFile(`${base}.json`, JSON.stringify(report, null, 2));
        await writeFile(`${base}.md`, markdownNl(report));
        console.log(summarizeNl(report));
        console.log(`→ ${base}.json, ${base}.md\n`);
        totals.businesses++;
        totals.answers += report.totalAnswers;
        totals.wrong += report.wrongAnswers;
        totals.findings += report.findings.length;
      } catch (err) {
        console.error(`${row.name} (${row.place}): mislukt – ${(err as Error).message}\n`);
      }
    }
    console.log(`Totaal: ${totals.businesses} bedrijven, ${totals.wrong} van ${totals.answers} antwoorden kloppen niet, ${totals.findings} bevindingen.`);
  } else if (args.name && args.place) {
    const report = await scanOne(args.name, args.place, args);
    console.log(summarizeNl(report));
    if (args.json) {
      await mkdir(path.dirname(args.json), { recursive: true });
      await writeFile(args.json, JSON.stringify(report, null, 2));
      console.log(`\n→ ${args.json}`);
    }
  } else {
    printUsage();
    process.exitCode = 1;
  }
  await db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
