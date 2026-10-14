# Vidalo — notes for Claude Code

Vidalo checks what AI assistants say about a Dutch business, finds wrong facts and their sources, publishes a facts page on the owner's domain, syncs directories, and fixes errors at the source with proof. Tagline: *Je klanten vragen het aan ChatGPT. Wij zorgen dat het antwoord klopt.*

## Renamed from Maicro (13 Oct 2026)
The product is **Vidalo** (from *videre*, to see). The code, copy (NL + EN), package names (`@vidalo/*`), env vars (`VIDALO_*`), Worker names (`vidalo-web`, `vidalo-worker`, queue `vidalo-scans`), cookies, emails (`hallo@vidalo.nl`) and domains (`vidalo.nl`) were renamed in one commit; on 14 Oct the domain became `vidalo.io` (`hallo@vidalo.io`), because `.nl` and `.com` are held by others. A rename of the product is not a rename of what is provisioned; these stay by hand:

| Thing | Status |
|---|---|
| GitHub repo `A101io/maicro` | Julian renames to `vidalo`. Then, in the same change: `scripts/site/snapshot.mjs` base path `/maicro/` → `/vidalo/`, and the Pages URL becomes `a101io.github.io/vidalo` |
| Supabase project name `maicro` (ref `bbynmqvaxpjdnkaasutd`) | display name only, Julian renames in the dashboard; the ref never changes |
| Committed migrations | keep the word Maicro in two comments; migrations are never edited |
| `docs/design-g/*.html` | the original design boards, kept as they were |
| Domain | **`vidalo.io`**, registered by Julian 14 Oct 2026 (`vidalo.nl` and `vidalo.com` are held by others). Code, copy, emails (`hallo@vidalo.io`) and `wrangler.jsonc` renamed the same day. Only `www.vidalo.io` redirects. Zone on Cloudflare: Julian |
| Stripe, Cloudflare Workers, Google OAuth app, Resend | none exist yet; create them as Vidalo |

## Resuming work — read this first
- **`SETUP_STATUS.md`** is the baseline status (v3); work rows that are not `✓verified`. **`docs/go-live-checklist.md`** is the launch gate, decisions for Julian first.
- Hosting is **Cloudflare** (decided 13 Oct 2026): `apps/web` runs as the Worker `vidalo-web` (OpenNext, custom entry `apps/web/worker.ts`), `apps/worker` as `vidalo-worker` (`src/cloudflare.ts`: cron, the `vidalo-scans` queue, facts pages). Deploys are manual: `.github/workflows/deploy.yml` (`preview` = mock data, `production`). The static mock preview also still goes to https://a101io.github.io/maicro/ on every push to main.
- Domains: `vidalo.io` is the site; `www.vidalo.io` is a Custom Domain on `vidalo-web` that 301s to it (`core/shared/canonical.ts`, used by `apps/web/worker.ts`). `workers_dev` stays on explicitly. **The first production deploy puts the product on vidalo.io**: there is no coming-soon gate yet, so that run is the launch (`docs/go-live-checklist.md`, Domains).
- **Local clone** (14 Oct 2026): `/Users/a101/Vidalo`, GitHub repo still `A101io/maicro`. `pnpm` comes from corepack; it was put on the PATH with `corepack enable --install-directory ~/bin`, because the OpenNext build spawns `pnpm build` in a child shell and dies with `pnpm: command not found` when only `corepack pnpm` works.
- **Env**: the root `.env` (gitignored) is read by the web app too (`apps/web/next.config.ts` loads it; a value already in the environment wins). Julian's file holds the Supabase URL + anon key and no `DATABASE_URL`, so sign-in is real and business data lives in memory. `.claude/launch.json` defines `vidalo-dev` (:3000) and `vidalo-worker` (:8787) for the browser tools.
- **Cloudflare**: account `37c9615a0d7d9629154eca03d7de59a6`. The mock preview is live at https://vidalo-web-preview.julian-devriend.workers.dev (deployed by hand 14 Oct 2026 from a local `wrangler login`); queue `vidalo-scans` exists. Production has no Hyperdrive, no secrets, and its Custom Domain cannot bind until `vidalo.io` is a zone in the account.
- Test the Cloudflare build locally: `pnpm --filter @vidalo/web cf:build`, then in `apps/web`: `npx wrangler dev -c wrangler.jsonc -c ../worker/wrangler.jsonc` with a `.dev.vars` (gitignored) per app, e.g. `VIDALO_MOCK=1`, `VIDALO_DB=pg`, `DATABASE_URL=` a local Postgres.
- NL lives at `/`, EN at `/en/...` (`apps/web/middleware.ts`, `lib/lang-paths.ts`, `lib/i18n.ts`). Copy: `packages/core/src/copy/index.ts` (Dutch, the source) and `en.ts` (same shape, enforced by `CopyShape`). Add a key to both or typecheck fails.

## How to write to Julian
Short. One action at a time. Real strings, not placeholders. End with one concrete question and a suggested answer when something needs him. Say plainly when something keeps failing. Never touch his iCloud folder.

## Things that cost an hour to rediscover
- **On Workers a database connection cannot cross requests.** Every request and job runs inside `withDb()` (core/shared/db.ts) with its own handle; anything that reads a module-level `db` instead hangs every second request ("Cannot perform I/O on behalf of a different request"). The scope lives on `globalThis` because the Worker entry and the Next server bundle core separately; two AsyncLocalStorage instances made the scope invisible. Measured: without it 200 500 200 500.
- **OpenNext runs the middleware twice on a rewrite**: the second pass sees the rewritten Dutch route, so `/en` came out Dutch until the middleware kept the first pass's language.
- **CSP `upgrade-insecure-requests` on an http origin blocks the scan form** (its own URL becomes https, not 'self'). Only added when `PUBLIC_BASE_URL` is https.
- **This cloud container cannot reach `*.supabase.co`, `a101io.github.io` or `api.stripe.com`.** Use the Supabase MCP tools (check the ref on every call) and the GitHub MCP tools; ask Julian to open the Pages site himself.
- **A script that touches React-rendered text before hydration makes React throw the server HTML away** and rebuild the page, which also drops every Web Animations API animation `motion.js` set up (scenes freeze, elements "not attached to the DOM"). `public/ask.js` therefore waits until the node carries a `__reactFiber` key. `motion.js` only animates, it never changes markup; keep it that way.
- **Next only reads `.env` from `apps/web`**, not the repo root the README points at; with the root file alone, every sign-in silently used the mock session while `/api/health` looked fine. `next.config.ts` now loads the root file.
- **An agent cannot click "Stuur inloglink"**: it sends a real e-mail, so the permission layer stops there. Drive the flow up to `/inloggen?business=…`, then hand the click to Julian and read the result afterwards.
- **`pkill -f next-server` kills the shell running it.** Find the pid with `ps` and kill that.
- **RLS tests on the hosted project**: run them as one `DO` block that sets role and JWT claims, then `raise exception` with the counts, so the transaction rolls back and nothing stays behind. Always include the owner as a control that must see rows.
- **CI Postgres**: Docker Hub's anonymous pull limit broke the service container; the job uses the runner's preinstalled Postgres.
- **GitHub Pages artifacts may not contain paths starting with `_`**: the snapshot renames `_next` to `assets`.
- **A server action that redirects into an API route hangs**; go through a page (`/eigenaar/bevestigen`).
- **Deleting a cookie during render is a server error** in Next 15; only route handlers and server actions may set cookies.
- **Supabase `create_project` via MCP timed out three times**; creating it in the dashboard worked.
- Two other Stripe accounts sit in the same company (Sitty `acct_1UA8rHEGTq7D30VV`, Sonable `acct_1TyIM8EQK4LIWEDd`); `pnpm stripe:setup` refuses both and pins Vidalo's.

## Read first
- `docs/CONTRACT.md` — module layout and rules (facts are owner-asserted; never claim "control"; no jargon).
- `docs/ARCHITECTURE.md` — workflows A–E and the fix-path table.
- `docs/CRITERIA.md` — the twelve criteria, severities, thresholds, the stipregel and the sector question sets (the scanner follows this literally).
- `docs/MESSAGING.md` — every customer-facing rule and the Dutch copy. All strings live in `packages/core/src/copy/index.ts`.
- `docs/DESIGN_G.md` — the visual spec (design G: Plus Jakarta Sans, white/ink/one blue accent, 1.5px borders, status colours only in dots, pills and report rows; reference boards in `docs/design-g/*.html` are the source of truth for copy, order and layout). `docs/DESIGN_RESEARCH.md` §3–4 (serif/paper) is superseded.

## Commands
```
pnpm install
pnpm -r typecheck && pnpm -r test          # must stay green
pnpm e2e:mock                              # whole pipeline in one process, no keys
pnpm verify:pg                             # migrations + PgDb + whole pipeline on a real local Postgres (PG_ADMIN_URL)
VIDALO_MOCK=1 pnpm dev                     # web on :3000 (demo owner eigenaar@bakkerijdevries.nl)
VIDALO_MOCK=1 pnpm worker                  # job loop + cron + facts pages on :8787
VIDALO_MOCK=1 pnpm scan --name "X" --place Y --kind free
pnpm --filter web build                    # needs fonts.googleapis.com (next/font/google Plus Jakarta Sans); offline: NEXT_FONT_GOOGLE_MOCKED_RESPONSES=<mock.js>
```

## State (v0.1)
Done and verified in mock mode: scanner core (5 engines, extraction, compare, attribute, CLI), web (landing, free scan, result, Stripe checkout, auth, dashboard, facts form, CNAME, Google OAuth), workers (publisher, 13 NL directories, GBP sync, fixer paths + rechecks, Dutch emails, queue + cron), "niet gevonden" state (finding `verdict: not_found`, report `notFoundAnswers` + `visibility`, own fix path, grey result-page hero; migration `0002_not_found.sql`), criteria + sector layer from `docs/CRITERIA.md` (12 criteria with severity + thresholds in `packages/core/src/criteria.ts`, 11 sector packs with recommendation questions in `packages/core/src/prompts/sectors.ts`, `inferSector`, facts fields `serviceArea` / `urgency` / `credentials` / `sector`, recommendation absence detection, stipregel with `ScanReport.stip` + per-engine colours + `findingsBySeverity` + `instable`, colour in emails and CLI markdown; migration `0003_sectors.sql`). Web re-skinned to design G (`docs/DESIGN_G.md`): landing with the 14 sections and anchors, result page in three states (rood/oranje, groen, grijs) built by `apps/web/lib/report.ts` from `ScanReport` (one row per question, answer cards, source rows, plan steps, never a score), demo reports at `/r/voorbeeld` (red) and `/r/voorbeeld-grijs` (grey) from `apps/web/lib/demo.ts`, static sector pages `/vak/[slug]` for the 11 packs (questions rendered from the pack templates with placeholder facts, `apps/web/lib/sector.ts`), sitemap, facts form with the sector-layer inputs, dashboard shell in G. All copy in `packages/core/src/copy/index.ts` (`landing`, `result`, `sector`, `sectorPages`). Screenshots in `out/screenshots/` (gitignored). `PgDb` is verified against a real Postgres by `pnpm verify:pg` (db tests run on both MemDb and PgDb; the mock pipeline runs on PgDb with `VIDALO_DB=pg`); not yet against a Supabase project.

Not built: Bing/Apple/form-directory adapters (fall to operator queue), Copilot browser adapter (`setCopilotAdapter`), WordPress plugin, quarterly plan.

## Supabase
Project `maicro`, ref **`bbynmqvaxpjdnkaasutd`**, eu-west-1 (Ireland), org A101BV — https://bbynmqvaxpjdnkaasutd.supabase.co.
Migrations 0001–0005 are applied (ledger: `supabase_migrations.schema_migrations`). Every public table has RLS; the four internal tables (`prompt`, `sample`, `claim`, `job`) have no policies, so only the service role / table owner reach them.
The same org holds **`hlelpndtejajipqwjwrf` (Sitty)** and **`muuijbupsnhascqzfbin` (Sonable)** — check the ref on every call; the names give no warning.
Not done yet: `DATABASE_URL` / service-role key in a secret store, and a run of the pipeline against this project.

## Next steps, in order
1. Real database: project and migrations done (see Supabase above). Remaining: put `DATABASE_URL` (pooler, service role) in `.env`, run `VIDALO_DB=pg pnpm e2e:mock` against it once, then clear the rows it wrote.
2. First real engine (runbook: `docs/FIRST-REAL-SCAN.md`): `OPENAI_API_KEY` (ChatGPT sampling + extraction). Run `pnpm scan --list <20 businesses in one town>` and read `out/scans/*.md`. This validates the idea before anything else.
3. `GOOGLE_PLACES_API_KEY` so business resolution and the `/scan/kies` step work.
4. Stripe (runbook: `docs/PAYMENTS.md`, `pnpm stripe:setup`; billing rules in `packages/core/src/billing`); Resend; deploy to Cloudflare (`deploy.yml`, token in `docs/secrets-and-keys.md`); Hyperdrive; Cloudflare for SaaS for facts hosts.
5. Then Gemini, Perplexity, SerpAPI.

## Conventions
- Customer-facing text: Dutch, informal "je", calm verbs, no exclamation marks, never GEO/AEO/LLM/prompt/credits/zichtbaarheid/platform/agent in UI. One exception, asked for by Julian: the "Straks" section (`copy.landing.agents`, `components/AgentsSection.tsx`) names AI-agent, OKF, schema.org, llms.txt, MCP, A2A, each explained in plain words with who published it and when. Claims there must match what the code does (the facts page publishes HTML, schema.org JSON-LD and llms.txt; OKF is followed, not yet published).
- Facts are versioned; a new version only via the owner's confirmation. Samples are evidence; findings are the diff.
- **Ownership is proven, never claimed.** An e-mail address (report capture, magic link) only says who asked. `business.owner_verified_at` is set by `/api/google/callback` when the signed-in Google account holds a Business Profile location whose place id equals `google_place_id` (`packages/core/src/shared/ownership.ts`); proof replaces any earlier claim. Saving facts, the domain, on-demand scans (`requireVerifiedOwner`) and every setup/publish/sync/fix/recheck job (`apps/worker/src/jobs/paid.ts`: paying AND verified) wait for it. A business without a place id cannot be verified automatically; that goes to hallo@vidalo.io.
- Keep `pnpm -r typecheck`, `pnpm -r test` and `pnpm e2e:mock` green before committing.
- One primary (blue) button per view. No dark mode. No emoji. Never show a score; only counts and the colour of the dot.
