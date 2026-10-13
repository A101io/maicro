# Maicro — notes for Claude Code

Maicro checks what AI assistants say about a Dutch business, finds wrong facts and their sources, publishes a facts page on the owner's domain, syncs directories, and fixes errors at the source with proof. Tagline: *Je klanten vragen het aan ChatGPT. Wij zorgen dat het antwoord klopt.*

## Read first
- `docs/CONTRACT.md` — module layout and rules (facts are owner-asserted; never claim "control"; no jargon).
- `docs/ARCHITECTURE.md` — workflows A–E and the fix-path table.
- `docs/CRITERIA.md` — the twelve criteria, severities, thresholds, the stipregel and the sector question sets (the scanner follows this literally).
- `docs/MESSAGING.md` — every customer-facing rule and the Dutch copy. All strings live in `packages/core/src/copy/index.ts`.
- `docs/DESIGN_G.md` — the visual spec (design G: Manrope, white/ink/one blue accent, 1.5px borders, status colours only in dots, pills and report rows; reference boards in `docs/design-g/*.html` are the source of truth for copy, order and layout). `docs/DESIGN_RESEARCH.md` §3–4 (serif/paper) is superseded.

## Commands
```
pnpm install
pnpm -r typecheck && pnpm -r test          # must stay green
pnpm e2e:mock                              # whole pipeline in one process, no keys
pnpm verify:pg                             # migrations + PgDb + whole pipeline on a real local Postgres (PG_ADMIN_URL)
MAICRO_MOCK=1 pnpm dev                     # web on :3000 (demo owner eigenaar@bakkerijdevries.nl)
MAICRO_MOCK=1 pnpm worker                  # job loop + cron + facts pages on :8787
MAICRO_MOCK=1 pnpm scan --name "X" --place Y --kind free
pnpm --filter web build                    # needs fonts.googleapis.com (next/font/google Manrope); offline: NEXT_FONT_GOOGLE_MOCKED_RESPONSES=<mock.js>
```

## State (v0.1)
Done and verified in mock mode: scanner core (5 engines, extraction, compare, attribute, CLI), web (landing, free scan, result, Stripe checkout, auth, dashboard, facts form, CNAME, Google OAuth), workers (publisher, 13 NL directories, GBP sync, fixer paths + rechecks, Dutch emails, queue + cron), "niet gevonden" state (finding `verdict: not_found`, report `notFoundAnswers` + `visibility`, own fix path, grey result-page hero; migration `0002_not_found.sql`), criteria + sector layer from `docs/CRITERIA.md` (12 criteria with severity + thresholds in `packages/core/src/criteria.ts`, 11 sector packs with recommendation questions in `packages/core/src/prompts/sectors.ts`, `inferSector`, facts fields `serviceArea` / `urgency` / `credentials` / `sector`, recommendation absence detection, stipregel with `ScanReport.stip` + per-engine colours + `findingsBySeverity` + `instable`, colour in emails and CLI markdown; migration `0003_sectors.sql`). Web re-skinned to design G (`docs/DESIGN_G.md`): landing with the 14 sections and anchors, result page in three states (rood/oranje, groen, grijs) built by `apps/web/lib/report.ts` from `ScanReport` (one row per question, answer cards, source rows, plan steps, never a score), demo reports at `/r/voorbeeld` (red) and `/r/voorbeeld-grijs` (grey) from `apps/web/lib/demo.ts`, static sector pages `/vak/[slug]` for the 11 packs (questions rendered from the pack templates with placeholder facts, `apps/web/lib/sector.ts`), sitemap, facts form with the sector-layer inputs, dashboard shell in G. All copy in `packages/core/src/copy/index.ts` (`landing`, `result`, `sector`, `sectorPages`). Screenshots in `out/screenshots/` (gitignored). `PgDb` is verified against a real Postgres by `pnpm verify:pg` (db tests run on both MemDb and PgDb; the mock pipeline runs on PgDb with `MAICRO_DB=pg`); not yet against a Supabase project.

Not built: Bing/Apple/form-directory adapters (fall to operator queue), Copilot browser adapter (`setCopilotAdapter`), WordPress plugin, quarterly plan.

## Supabase
Project `maicro`, ref **`bbynmqvaxpjdnkaasutd`**, eu-west-1 (Ireland), org A101BV — https://bbynmqvaxpjdnkaasutd.supabase.co.
Migrations 0001–0005 are applied (ledger: `supabase_migrations.schema_migrations`). Every public table has RLS; the four internal tables (`prompt`, `sample`, `claim`, `job`) have no policies, so only the service role / table owner reach them.
The same org holds **`hlelpndtejajipqwjwrf` (Sitty)** and **`muuijbupsnhascqzfbin` (Sonable)** — check the ref on every call; the names give no warning.
Not done yet: `DATABASE_URL` / service-role key in a secret store, and a run of the pipeline against this project.

## Next steps, in order
1. Real database: project and migrations done (see Supabase above). Remaining: put `DATABASE_URL` (pooler, service role) in `.env`, run `MAICRO_DB=pg pnpm e2e:mock` against it once, then clear the rows it wrote.
2. First real engine (runbook: `docs/FIRST-REAL-SCAN.md`): `OPENAI_API_KEY` (ChatGPT sampling + extraction). Run `pnpm scan --list <20 businesses in one town>` and read `out/scans/*.md`. This validates the idea before anything else.
3. `GOOGLE_PLACES_API_KEY` so business resolution and the `/scan/kies` step work.
4. Stripe (runbook: `docs/PAYMENTS.md`, `pnpm stripe:setup`; billing rules in `packages/core/src/billing`); Resend; deploy web (Vercel) and worker (Fly/Railway); Cloudflare for SaaS for facts hosts.
5. Then Gemini, Perplexity, SerpAPI.

## Conventions
- Customer-facing text: Dutch, informal "je", calm verbs, no exclamation marks, never GEO/AEO/LLM/prompt/credits/zichtbaarheid/platform/agent in UI. One exception, asked for by Julian: the "Straks" section (`copy.landing.agents`, `components/AgentsSection.tsx`) names AI-agent, OKF, schema.org, llms.txt, MCP, A2A, each explained in plain words with who published it and when. Claims there must match what the code does (the facts page publishes HTML, schema.org JSON-LD and llms.txt; OKF is followed, not yet published).
- Facts are versioned; a new version only via the owner's confirmation. Samples are evidence; findings are the diff.
- **Ownership is proven, never claimed.** An e-mail address (report capture, magic link) only says who asked. `business.owner_verified_at` is set by `/api/google/callback` when the signed-in Google account holds a Business Profile location whose place id equals `google_place_id` (`packages/core/src/shared/ownership.ts`); proof replaces any earlier claim. Saving facts, the domain, on-demand scans (`requireVerifiedOwner`) and every setup/publish/sync/fix/recheck job (`apps/worker/src/jobs/paid.ts`: paying AND verified) wait for it. A business without a place id cannot be verified automatically; that goes to hallo@maicro.nl.
- Keep `pnpm -r typecheck`, `pnpm -r test` and `pnpm e2e:mock` green before committing.
- One primary (blue) button per view. No dark mode. No emoji. Never show a score; only counts and the colour of the dot.
