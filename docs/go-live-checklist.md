# Go-live checklist (baseline A2)

The launch gate. "continue" resumes from the first row that is not ✓. Status key: `✓verified` (observed, with evidence and date) · `written` (code exists, not proven against real infrastructure) · `blocked` (names what it needs) · `open` · `n/a`. Not legal advice.

## Decisions for Julian first
| # | Decision | Status |
|---|---|---|
| J1 | Product name: **Vidalo** (Julian, 13 Oct 2026; was Maicro). Web search found no Vidalo brand; nearest: Vidado (AI data extraction), Vidyo (video calls). Formal TMview check (EUIPO + BOIP) and the domains are Julian's. | decided; TMview + domains open |
| J2 | Domain: **`vidalo.nl` is the main domain**; `vidalo.com` and `vidalo.io` redirect to it (Julian, 13 Oct 2026). `.com` and `.io` at Cloudflare Registrar, `.nl` at a Dutch registrar with DNS on Cloudflare. | decided; registration: Julian |
| J3 | Hosting: **all on Cloudflare** (Julian, 13 Oct 2026): `vidalo-web` (OpenNext) and `vidalo-worker` (cron, scan queue, facts pages), A101's account. | decided |
| J4 | Launch gate: the GitHub Pages preview (`a101io.github.io/maicro`, mock data) stays **public until there is a domain** (Julian, 13 Oct 2026). A coming-soon gate comes with the production deploy. | decided |

## Product
| # | Item | Status |
|---|---|---|
| P1 | Landing, scenes, simulator, Straks section, pricing, sector pages, result pages | written (mock mode), screenshots in `out/screenshots/` |
| P2 | NL + EN with `/en/...` URLs, hreflang, language switch | written |
| P3 | First real scan (`docs/FIRST-REAL-SCAN.md`) on 20 businesses | blocked: `OPENAI_API_KEY` |

## Database
| # | Item | Status |
|---|---|---|
| D1 | Supabase `bbynmqvaxpjdnkaasutd`, migrations 0001–0005, RLS on all 11 tables | ✓verified 13 Oct 2026: anon 0, stranger 0, owner 1 (control), rolled back |
| D2 | Paid plan, daily backups, one restore drill | blocked: Julian (billing) |
| D3 | `DATABASE_URL` as a secret on `vidalo-web` and `vidalo-worker`, `/api/health` says `"db":"pg"` | blocked: Julian (Supabase pooler URL) |
| D4 | Merge Dependabot #11 (`@supabase/ssr` 0.5 → 0.12, breaking for a 0.x package) after trying the magic-link sign-in on its branch against the real project | blocked: D3 |

## Billing
| # | Item | Status |
|---|---|---|
| B1 | Vidalo's own Stripe account, id pinned as `VIDALO_STRIPE_ACCOUNT` | blocked: Julian creates it; `api.stripe.com` must be allowed for the session |
| B2 | `pnpm stripe:setup --apply` (prices, 21% tax rate, webhook) | blocked: B1 |
| B3 | Terms and Privacy URLs set in Stripe settings | blocked: B1 + legal pages |
| B4 | One live purchase on a real card, refunded | blocked: B2 |

## Deploy
| # | Item | Status |
|---|---|---|
| X1 | CI on every PR: secret scan, typecheck, tests, mock pipeline, Postgres | ✓verified (GitHub Actions green on PR #8) |
| X2 | Deploy workflow, manual (`workflow_dispatch`, `preview` or `production`), `.github/workflows/deploy.yml`, ends with `scripts/verify-deploy.mjs` | written: verified locally in workerd (preview passes; a production without database fails with the reason). Needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` on the GitHub environments |
| X2b | Hyperdrive for Supabase (`wrangler hyperdrive create vidalo-db`), id into both wrangler.jsonc files | blocked: D3 (`DATABASE_URL`) |
| X3 | Security headers + CSP | written: headers seen on the dev server 13 Oct; CSP only in production builds |
| X4 | Error monitoring (EU), uptime checks on `/`, `/privacy`, `/api/health` | open |
| X5 | Rollback: previous deployment + forward-fix migration, tried once | open |

## Practise what we preach (Vidalo as its own first customer)
What the site promises a customer exists for Vidalo itself, from one record: `packages/core/src/shared/own.ts` (`OWN_FACTS`, `OWN_BUSINESS`). The web app renders it at `/feiten`, in the structured data of every page and in `/llms.txt`; the worker upserts Vidalo as a business at every start and runs setup, publish, directory sync and the monthly scan for it (`ensureOwnBusiness`). The guard test `packages/core/test/own.test.ts` fails when a criterium goes unanswered that is not on its open list.

| # | Item | Status |
|---|---|---|
| W1 | Own facts page in three forms (HTML, schema.org, llms.txt), dated, on our own site | written: `/feiten`, `organizationLd`, `/llms.txt` |
| W2 | Facts confirmed by the owner (`OWN_FACTS_VERIFIED_AT`); until then the page says "nog niet bevestigd" | blocked: Julian confirms address, hours (now ma–vr 09:00–17:00), what we do and do not do |
| W3 | Phone number, payment methods, name clashes ("niet te verwarren met"), erkenningen | blocked: Julian (the four open items in `own.test.ts`) |
| W4 | Vidalo in the directories, Google Business Profile, Bing, Apple (the `sync` job, same as a customer) | blocked: the first production deploy and a Google Business Profile for Vidalo (gives the place id) |
| W5 | Monthly scan of Vidalo itself: "Wat zegt AI over Vidalo?" | blocked: `OPENAI_API_KEY` (P3) and the first production deploy |
| W6 | `feiten.vidalo.nl` as the own facts host, DNS at Cloudflare | blocked: registration of vidalo.nl (J2) |

## Legal
| # | Item | Status |
|---|---|---|
| L1 | Terms, privacy, cookie statement from the De Boer Legal masters, NL + EN, at `/legal/*` | blocked: masters not in this environment (upload) + counsel review |
| L2 | Processors, records of processing, DPIA screening | written (`docs/processors.md`, `docs/records-of-processing.md`, `docs/legal-compliance-guidelines.md`) |

## Domains (J2)
Written as if the three domains exist (Julian, 13 Oct 2026: "ga er even van uit"). Nothing is bound until a production deploy runs.

| # | Item | Status |
|---|---|---|
| D1 | Register `vidalo.com` and `vidalo.io` at Cloudflare Registrar, `vidalo.nl` at a Dutch registrar; add `vidalo.nl` to Cloudflare as a zone and set its nameservers there | blocked: Julian |
| D2 | `vidalo-web` binds `vidalo.nl`, `www.vidalo.nl`, `vidalo.com`, `www.vidalo.com`, `vidalo.io`, `www.vidalo.io` as Custom Domains (`apps/web/wrangler.jsonc`); every host but `vidalo.nl` answers 301 to the same path on `vidalo.nl` (`apps/web/worker.ts`, `packages/core/src/shared/canonical.ts`) | written; proven in workerd with a Host header (301 for .io/.com/www, 200 for .nl and workers.dev) |
| D3 | Deploy check: production verifies `https://vidalo.nl`, then `--redirects` for the five other hosts (`scripts/verify-deploy.mjs`) | written |
| D4 | Cloudflare token gains **Zone · Workers Routes · Edit** on the three zones (docs/secrets-and-keys.md) | blocked: D1 |
| D5 | Fallback facts hosts `{slug}.feiten.vidalo.nl` are two levels deep: Universal SSL covers only `*.vidalo.nl`, so they need Advanced Certificate Manager (about $10/month) or a one-level scheme such as `{slug}-feiten.vidalo.nl` | decision: Julian |
| D6 | `feiten.vidalo.nl` as the CNAME target for customers' own domains (Cloudflare for SaaS, fallback origin on `vidalo-worker`) | open |

⚠ With D2 in place, the first production deploy puts the product on `vidalo.nl`. There is no coming-soon gate yet (J4). That deploy is the one-way door below, not a routine step.

## The one-way door
Pointing the real domain at production, with live Stripe prices, is the launch. It waits for Julian's explicit yes, and for every row above to be ✓ or consciously accepted.
