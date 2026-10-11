# Setup status: Maicro

Baseline v3 · Last checked: 2026-10-11 (repo audit at `70f7eef`; nothing was run against live Supabase, Stripe or a deployed site)
Status key: ✓verified (observed, evidence + date) · written (code exists, not proven on real infra) · blocked (needs Julian/counsel) · open · n/a
Compliance checks here are an aid, not legal advice. The baseline itself lives in the project's shared setup folder (`setup/README.md`).

## Project facts
- Product / domain: Maicro · maicro.nl (from copy; DNS not checked)
- Entity: A101 B.V. (handelend als Maicro), Factorij 80, 3071 AV Rotterdam · KvK 42057858 · VAT NL869514192B01 (VAT number not yet shown on the site)
- Support address: hallo@maicro.nl
- Audience: B2B (Dutch businesses)
- Languages: NL only
- Supabase: `bbynmqvaxpjdnkaasutd`, eu-west-1 (Ireland), org A101BV
- Stripe account id: not recorded (`MAICRO_STRIPE_ACCOUNT` is in `.env.example` but no code reads it)
- Features: accounts (Supabase Auth + Google OAuth) · payments (Stripe) · AI engines (scanner) · outbound email (Resend) · no native app

## R. Required
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| R1 | Supabase: own EU project, RLS everywhere, anon-zero-rows test with control | written | All 11 tables enable RLS (`0001_init.sql`, `0004_rls_internal_tables.sql`); owner policies are select-only; internal tables have none. Missing: an anon/stranger-sees-0-rows test with a control against the real project, and an advisors run. | 2026-10-11 |
| R2 | Legal pages (terms, privacy, cookies) + footer links + company identity | blocked | `/voorwaarden` and `/privacy` exist with a draft banner and `noindex` (`copy.legal.draft: true`). Gaps: texts are self-written, not built from the De Boer Legal masters; **no cookie statement page**; footer has no VAT number and no cookie link. Needs counsel review. | 2026-10-11 |
| R3 | Fixed header, verified on desktop and mobile | written | `.site-header { position: sticky; top: 0; z-index: 40 }` in `globals.css`; `[id] { scroll-margin-top: 88px }`. Gap: nav links are `hidden md:inline`, so a phone has no menu, only "Inloggen". Not yet checked with Playwright. | 2026-10-11 |

## A. Foundation
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| A1 | CLAUDE.md (resume, how to write to Julian, cost-an-hour list) | written | Has read-first, commands, state and next steps. Missing "How to write to Julian" and a "cost an hour to rediscover" list. | 2026-10-11 |
| A2 | docs/go-live-checklist.md | open | No launch gate yet. | |
| A3 | docs/legal-compliance-guidelines.md | open | `docs/MESSAGING.md` and `docs/CONTRACT.md` cover copy rules ("never claim control"); no claims/VAT/personal-data/counsel file. | |
| A4 | docs/secrets-and-keys.md | open | `.env.example` lists every variable; no doc on where each comes from or how to prove it landed. | |
| A5 | Secret hygiene + scan | written | `.env`/`.env.local` gitignored; only the two `.env.example` files are tracked (`git ls-files`). No secret-scan script. | 2026-10-11 |
| A6 | Supabase project ref guard | written | CLAUDE.md names this ref and the Sitty and Sonable refs in the same org. | 2026-10-11 |

## B. Supabase hardening
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| B1 | Migrations verified via /rest/v1 after schema reload | open | CLAUDE.md says 0001–0004 are applied; `0005_owner_verified.sql` is newer and not mentioned. Not verified over the API. | |
| B2 | SECURITY DEFINER / queues / cron secret locked down | ✓verified (repo) | No `SECURITY DEFINER` function in any migration (grep, 0 hits); internal tables have RLS and no policies. Re-check after the next function is added. | 2026-10-11 |
| B3 | Auth: site_url, redirects, rate limit, leaked-password, email flows | open | | |
| B4 | Turnstile on public forms | open | The free scan form is public and only rate-limited by `FREE_SCANS_PER_DAY`; no captcha. | |
| B5 | Cron verified | n/a | Jobs run in `apps/worker` (own queue + cron), not pg_cron. Verify by job rows once deployed. | |

## D. Deploy, domain, headers
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| D1 | CI on every PR | written | `ci.yml`: typecheck, unit tests, `e2e:mock`, `verify:pg` on PR and main. | 2026-10-11 |
| D2 | Production deploy + preview | open | Only `site.yml` (static mock snapshot to GitHub Pages). CLAUDE.md plans Vercel (web) + Fly/Railway (worker); pick EU regions. | |
| D3 | No empty env overrides; no-backend build refuses to run | open | | |
| D4 | Deployed bundle verified | open | | |
| D5 | Domain on Cloudflare, routes in code | open | | |
| D6 | Launch gate (legal + support reachable) | open | | |
| D7 | Security headers + CSP | open | `next.config.ts` sets no headers. | |
| D8 | Health endpoint | open | | |

## E. Quality
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| E1 | Unit + browser e2e with controls | written | Vitest in core and worker; `e2e:mock` runs the whole pipeline. No Playwright browser tests. | 2026-10-11 |
| E2 | Accessibility WCAG AA (light only; no dark mode by design) | open | | |
| E3 | Daily checks, no continue-on-error | open | | |
| E4 | Dependency audit clean | open | | |

## F. Growth and measurement
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| F1 | i18n | open | NL only. Decide whether EN is needed for a Dutch-only product. | |
| F2 | SEO basics | written | `robots.ts` (private routes disallowed), `sitemap.ts`, `<html lang="nl">`, `metadataBase`. Missing: OG/Twitter image, Organization JSON-LD. | 2026-10-11 |
| F3 | Brand assets from one SVG | written | `app/icon.svg`. No OG image or apple-touch icon. | 2026-10-11 |
| F4 | Consent-gated analytics | open | No analytics at all yet, so no banner is needed today. Required before any marketing channel opens. | |
| F5 | 404 and error pages | written | `app/not-found.tsx`. | 2026-10-11 |

## G. Support and email
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| G1 | Support address, /support, auto-reply | written | hallo@maicro.nl in the footer; mailbox not verified; no `/support` page. | 2026-10-11 |
| G2 | Transactional email | written | Resend in `packages/core/src/reporter/mail.ts`, unsubscribe link + `UNSUBSCRIBE_SECRET`, `/afmelden`. SPF/DKIM/DMARC not checked. | 2026-10-11 |

## H. Operations and resilience
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| H1 | Backups + restore drill | open | Supabase plan and backup settings not checked; no restore tried. | |
| H2 | Error monitoring (EU) | open | No error tracker in the code (grep for Sentry: 0 hits). | |
| H3 | Uptime checks + alerts | open | | |
| H4 | Rate limiting | written | Free scans capped per day (`FREE_SCANS_PER_DAY`, default 25, `apps/web/lib/env.ts`); event-count queries support limits (`db/types.ts`). No limits on login, report email or webhooks. | 2026-10-11 |
| H5 | Staging environment | open | One Supabase project; mock mode covers local work. | |
| H6 | Rollback plan | open | | |
| H7 | Dependency updates | open | No Dependabot/Renovate config in `.github/`. | |
| H8 | 2FA + least privilege on operator accounts | open | Not checkable from the repo. | |
| H9 | Incident + breach runbook | open | | |
| H10 | security.txt | open | | |
| H11 | Cost alerts and caps | written | AI scan spend bounded by the daily free-scan cap; mock mode when keys are empty. No budget alerts on vendors. | 2026-10-11 |

## P. Privacy operations
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| P1 | Processors list + DPAs | open | Processors in use: Supabase, Stripe, Resend, Google (OAuth, Places, Business Profile), OpenAI/Gemini/Perplexity/SerpAPI, Cloudflare, KvK API. No list or DPAs recorded. | |
| P2 | Records of processing | open | | |
| P3 | DPIA screening | open | Business data mostly, plus owner emails; screening likely says no DPIA, but write it down. | |
| P4 | Proof of consent | open | No consent or terms-version columns in the migrations. | |
| P5 | Retention jobs | open | Report links expire after 30 days (copy); no deletion job found. | |

## C. Conditional
| # | Step | Status | Evidence | Date |
|---|---|---|---|---|
| C1 | Payments | written | Checkout has `tax_id_collection` and required billing address; prices shown excl. btw; webhook verifies the signature and skips duplicate event ids (`packages/core/src/billing`). Gaps: Stripe account id never checked in code; no `consent_collection`/Terms URL; checkout not checked against the Checklist Informatieverplichtingen; no live test purchase. | 2026-10-11 |
| C2 | Accounts: export + delete | open | No export or delete-account path found. | |
| C3 | AI: spend capped | written | Free scans capped by `FREE_SCANS_PER_DAY`; mock mode when keys are empty. No spend doc. | 2026-10-11 |
| C4 | B2C terms | n/a | B2B product. | |
| C5 | Native app | n/a | | |
| C6 | Trademark check (EUIPO + BOIP) | open | Renamed from Seatme; "Maicro" not yet checked. | |
| C7 | Accessibility statement | n/a | B2B service from a microenterprise; publish one anyway when convenient. | |

## Legal review log
| Check | Result | Note |
|---|---|---|
| Built from De Boer Legal masters | fail | Own draft text |
| Cookie statement exists | fail | No page; Supabase auth cookies are functional and still need listing |
| Company identity on site | partial | Name, address, KvK in footer; VAT number missing |
| Draft clearly marked | pass | Banner + noindex while `draft: true` |

## Needs Julian
- Legal: adapt the De Boer Legal B2B masters for Maicro (terms, privacy, cookies) and send them for review, or keep Maicro's own draft and send that?
- Staging: a separate Supabase project for previews (extra monthly cost) or keep previews on mock data only?
