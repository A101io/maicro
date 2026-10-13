# Go-live checklist (baseline A2)

The launch gate. "continue" resumes from the first row that is not ✓. Status key: `✓verified` (observed, with evidence and date) · `written` (code exists, not proven against real infrastructure) · `blocked` (names what it needs) · `open` · `n/a`. Not legal advice.

## Decisions for Julian first
| # | Decision | Status |
|---|---|---|
| J1 | Product name: **Vidalo** (Julian, 13 Oct 2026). Logo and site font done on branch `claude/brave-gauss-8nu8ln`. Trademark check (EUIPO + BOIP) still open. | decided |
| J2 | Domain: **vidalo.io** (Julian, 13 Oct 2026). Registration and DNS at Cloudflare still to do. | decided |
| J3 | Hosting: CLAUDE.md plans Vercel (web) + Fly/Railway (worker); the A101 default is Cloudflare Workers. | blocked: Julian |
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
| D3 | `DATABASE_URL` in the host env, `/api/health` says `"db":"pg"` | blocked: hosting (J3) |

## Billing
| # | Item | Status |
|---|---|---|
| B1 | Maicro's own Stripe account, id pinned as `MAICRO_STRIPE_ACCOUNT` | blocked: Julian creates it; `api.stripe.com` must be allowed for the session |
| B2 | `pnpm stripe:setup --apply` (prices, 21% tax rate, webhook) | blocked: B1 |
| B3 | Terms and Privacy URLs set in Stripe settings | blocked: B1 + legal pages |
| B4 | One live purchase on a real card, refunded | blocked: B2 |

## Deploy
| # | Item | Status |
|---|---|---|
| X1 | CI on every PR: secret scan, typecheck, tests, mock pipeline, Postgres | ✓verified (GitHub Actions green on PR #8) |
| X2 | Production deploy workflow, manual (`workflow_dispatch`) | blocked: J3 |
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
| W4 | Vidalo in the directories, Google Business Profile, Bing, Apple (the `sync` job, same as a customer) | blocked: hosting (J3) and a Google Business Profile for Vidalo (gives the place id) |
| W5 | Monthly scan of Vidalo itself: "Wat zegt AI over Vidalo?" | blocked: `OPENAI_API_KEY` (P3) and hosting |
| W6 | `feiten.vidalo.io` as the own facts host, DNS at Cloudflare | blocked: domain (J2, decided: vidalo.io) |

## Legal
| # | Item | Status |
|---|---|---|
| L1 | Terms, privacy, cookie statement from the De Boer Legal masters, NL + EN, at `/legal/*` | blocked: masters not in this environment (upload) + counsel review |
| L2 | Processors, records of processing, DPIA screening | written (`docs/processors.md`, `docs/records-of-processing.md`, `docs/legal-compliance-guidelines.md`) |

## The one-way door
Pointing the real domain at production, with live Stripe prices, is the launch. It waits for Julian's explicit yes, and for every row above to be ✓ or consciously accepted.
