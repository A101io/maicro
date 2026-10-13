# Module contract (read before touching code)

Monorepo: pnpm workspace. Node 22, TypeScript, ESM.

- `packages/core` — all domain logic, no framework code. Sub-paths:
  - `types` — shared types (owner: scaffold; do not change shapes without updating SQL + all consumers).
  - `db` — `postgres` (postgres.js) client + typed query helpers (`getBusiness`, `latestFacts`, `insertFacts`, `listPrompts`, `createScanRun`, `insertSamples`, `insertClaims`, `upsertFindings`, `enqueueJob`, `claimJob`, `completeJob`, `logEvent`, ...). Env: `DATABASE_URL`.
  - `prompts` — Dutch prompt templates per `FactKey`; `generatePrompts(facts): Prompt[]` (~20).
  - `scanner` — `runScan({businessId, kind, engines, samplesPerPrompt})`: sample engines → extract claims → compare with facts → attribute sources → persist findings → return `ScanReport`. Engines behind one interface `Engine.ask(promptNl) -> {answerText, citations, costCents}`. `VIDALO_MOCK=1` (or missing keys) uses a deterministic mock engine that injects plausible wrong facts so the whole pipeline runs offline.
  - `publisher` — `renderFactsPage(facts, business) -> {html, jsonLd, llmsTxt}`; `publishFactsPage(businessId)`; channel sync adapters (`gbp`, `bing`, `apple`, `directory`) with a common `syncChannel(channel, facts)`; IndexNow ping.
  - `fixer` — `openFixesForFindings(scanRunId)`: one fix path per `SourceType` (table in docs/ARCHITECTURE); email templates (Dutch); `scheduleRecheck`.
  - `reporter` — monthly report email (Dutch, plain), proof-card data, welcome/baseline emails. Email via Resend; `VIDALO_MOCK` writes .eml files to `out/mail/`.
  - `copy` — all Dutch customer-facing strings used by web + emails, one file, so wording stays consistent with the messaging brief.
- `apps/web` — Next.js 15 (app router), Tailwind, server actions + route handlers. Reads via Supabase anon + RLS for the dashboard, writes via `@vidalo/core/db` (service role) in route handlers. Stripe Checkout + webhook → enqueues `publish` job.
- `apps/worker` — single Node process: polls `job` table (`claimJob`), dispatches to core (`scan`, `publish`, `sync`, `fix`, `recheck`, `report`), plus a cron tick (monthly scans by `anniversary_day`, rechecks due, dunning states).

Rules:
- Facts are owner-asserted and versioned; never auto-change facts from scraped data after `verified_at` is set.
- Never claim "control"; copy says controleren / vinden / herstellen / bewijzen.
- No jargon in customer-facing strings: no GEO/AEO/LLM/prompt/credits.
- All customer-facing text in Dutch, informal "je".
