# Maicro — notes for Claude Code

Maicro checks what AI assistants say about a Dutch business, finds wrong facts and their sources, publishes a facts page on the owner's domain, syncs directories, and fixes errors at the source with proof. Tagline: *Je klanten vragen het aan ChatGPT. Wij zorgen dat het antwoord klopt.*

## Read first
- `docs/CONTRACT.md` — module layout and rules (facts are owner-asserted; never claim "control"; no jargon).
- `docs/ARCHITECTURE.md` — workflows A–E and the fix-path table.
- `docs/CRITERIA.md` — the twelve criteria, severities, thresholds, the stipregel and the sector question sets (the scanner follows this literally).
- `docs/MESSAGING.md` — every customer-facing rule and the Dutch copy. All strings live in `packages/core/src/copy/index.ts`.
- `docs/DESIGN_RESEARCH.md` §3–4 — the visual spec (Instrument Serif + IBM Plex, paper/ink/one blue accent, 1px borders, no gradients, status colours only inside report cards).

## Commands
```
pnpm install
pnpm -r typecheck && pnpm -r test          # must stay green
pnpm e2e:mock                              # whole pipeline in one process, no keys
MAICRO_MOCK=1 pnpm dev                     # web on :3000 (demo owner eigenaar@bakkerijdevries.nl)
MAICRO_MOCK=1 pnpm worker                  # job loop + cron + facts pages on :8787
MAICRO_MOCK=1 pnpm scan --name "X" --place Y --kind free
```

## State (v0.1)
Done and verified in mock mode: scanner core (5 engines, extraction, compare, attribute, CLI), web (landing, free scan, result, Stripe checkout, auth, dashboard, facts form, CNAME, Google OAuth), workers (publisher, 13 NL directories, GBP sync, fixer paths + rechecks, Dutch emails, queue + cron), "niet gevonden" state (finding `verdict: not_found`, report `notFoundAnswers` + `visibility`, own fix path, grey result-page hero; migration `0002_not_found.sql`), criteria + sector layer from `docs/CRITERIA.md` (12 criteria with severity + thresholds in `packages/core/src/criteria.ts`, 11 sector packs with recommendation questions in `packages/core/src/prompts/sectors.ts`, `inferSector`, facts fields `serviceArea` / `urgency` / `credentials` / `sector`, recommendation absence detection, stipregel with `ScanReport.stip` + per-engine colours + `findingsBySeverity` + `instable`, colour in emails and CLI markdown; migration `0003_sectors.sql`). The web facts form does not yet have inputs for the new facts fields (the server action parses `serviceAreaPlaces`, `serviceAreaRadiusKm`, `urgencyAvailable`, `urgencyHours`, `credentials`, `sector` when present). `PgDb` has not been run against a real Postgres yet.

Not built: Bing/Apple/form-directory adapters (fall to operator queue), Copilot browser adapter (`setCopilotAdapter`), WordPress plugin, quarterly plan.

## Next steps, in order
1. Real database: create Supabase project, apply `supabase/migrations/0001_init.sql`, `0002_not_found.sql` and `0003_sectors.sql`, set `DATABASE_URL`, `MAICRO_MOCK=0`, run `pnpm e2e:mock` against it, fix `PgDb` issues.
2. First real engine: `OPENAI_API_KEY` (ChatGPT sampling + extraction). Run `pnpm scan --list <20 businesses in one town>` and read `out/scans/*.md`. This validates the idea before anything else.
3. `GOOGLE_PLACES_API_KEY` so business resolution and the `/scan/kies` step work.
4. Stripe test keys + prices; Resend; deploy web (Vercel) and worker (Fly/Railway); Cloudflare for SaaS for facts hosts.
5. Then Gemini, Perplexity, SerpAPI.

## Conventions
- Customer-facing text: Dutch, informal "je", calm verbs, no exclamation marks, never GEO/AEO/LLM/prompt/credits/zichtbaarheid/platform/agent in UI.
- Facts are versioned; a new version only via the owner's confirmation. Samples are evidence; findings are the diff.
- Keep `pnpm -r typecheck`, `pnpm -r test` and `pnpm e2e:mock` green before committing.
- One primary button per view. No dark mode. No emoji.
