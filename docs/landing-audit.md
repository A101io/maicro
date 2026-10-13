# Landing audit, 13 Oct 2026

Goal of `/`: turn a reader into a paying customer, via the free check. Measured with Playwright on the dev server (mock data), reduced motion.

## Before
| | Desktop 1280×800 | Phone 390×844 |
|---|---|---|
| Page height | 16,560 px = **20.7 screens** | 26,957 px = **31.9 screens** |
| Sections | 17 | 17 |
| Words in `<main>` | 3,111 (≈14 min reading) | same |
| Calls to action (scan field) | at 0.5k px and 16k px: **none for 19 screens in between** | none for 30 screens |
| Pricing starts at | 86% of the page | 87% |
| Interactive proof (simulator) | screen 3 | screen 4 |

SEO/GEO before: no canonical on `/`, `/prijzen`, `/en`; no Open Graph or Twitter tags and no share image; meta description is the tagline; JSON-LD only Organization (no Service/Offer, no FAQPage); sitemap without `/en`, legal pages or hreflang; Vidalo's own site has no `/llms.txt` (the thing it sells).

## Decision
- `/` keeps what converts: hero + check, the simulator (proof), what it costs you (one scene + three numbers), how it works (four steps), the example report, price, FAQ, final check. A check field after the proof and after the report.
- The explanation moves to its own pages, each a search and AI-assistant answer in its own right: `/waarom` (how AI answers about a business: veranderd, leest, snippers, loket, niet gevonden), `/hoe-het-werkt` (sync, twenty asks, criteria, every month), `/straks` (assistants talking to each other, OKF and the other terms). English at `/en/why`, `/en/how-it-works`, `/en/whats-next`.
- Structured data: Organization, WebSite, Service with two Offers (€149 once, €49/month, excl. VAT), FAQPage, DefinedTermSet on `/straks`, BreadcrumbList on the sub-pages. Canonical, Open Graph and a share image on every page. A sitemap with both languages and hreflang. `/llms.txt` describing Vidalo.

## After (same measurement)
| | Desktop 1280×800 | Phone 390×844 |
|---|---|---|
| Page height | 8,279 px = **10.3 screens** (−50%) | 12,730 px = **15.1 screens** (−53%) |
| Sections | 12 | 12 |
| Words in `<main>` | 1,194 (≈5 min reading, −62%) | same |
| Check fields | at 0.5k, 2.0k, 5.4k and 7.6k px: never more than ~4 screens apart | at 0.3k, 2.7k, 8.6k, 11.7k px |
| Pricing starts at | ~64% of the page | ~66% |

Order on `/`: hero + check · Vraag het zelf · check · what it costs you (one scene + three numbers) · the four steps + links to the explainer pages · example report · red to green · check · price · FAQ · trades · final check.

SEO/GEO after: canonical, hreflang, Open Graph + Twitter + a generated share image (`app/opengraph-image.tsx`) on every page; the landing carries Organization, WebSite, Service with both Offers (excl. btw) and FAQPage; explainer pages carry BreadcrumbList, `/straks` a DefinedTermSet; sitemap with 32 URLs (16 routes × NL/EN) and hreflang, legal drafts left out while they are noindex; `robots.txt` names the AI crawlers; `/llms.txt` describes Vidalo from the same copy as the pages.

Not measured (needs real traffic): conversion itself. Once there is a domain, track: check started per visit, report → checkout, by entry page.
