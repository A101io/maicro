# Legal and compliance guidelines (baseline A3)

Read before writing anything a customer will read. This is a compliance aid, not legal advice.

## Claims we make, and what backs each

| Claim | Where | Backed by |
|---|---|---|
| "Wij zorgen dat het antwoord klopt" (tagline) | Everywhere | Softened everywhere it matters: "Niemand bepaalt wat een AI-assistent antwoordt" (FAQ, terms). Counsel to confirm the tagline reads as an aim, not a guarantee. |
| Statistics (45% CBS, 1 op 5 SearchLab, 37% KPMG, 61/22/17% sources, Insites 10.000) | Landing | Each carries its source on the page. Keep the source line with the number. |
| "Herstel bij bronnen van derden kan tot 14 dagen duren" | Pricing | Typical, not promised: the terms say it depends on the third party. |
| Facts page in HTML, schema.org and llms.txt | Landing "Straks" | `packages/core/src/publisher/render.ts` |
| OKF "volgen we" | Landing "Straks" | A statement of intent only; nothing is published in OKF yet. Do not say "OKF-compatible" until it is. |
| Fictional examples (bakkers, Van Dijk, Hendriks…) | Scenes, simulator, report | Every one is captioned as fictional. Keep the caption with the example. |

## Never use
- Words: GEO, AEO, LLM, prompt, credits, zichtbaarheid, platform, agent (except in the "Straks" glossary, explained), garantie, gegarandeerd, controle over AI.
- Never claim control over what an AI says; never promise to be named or ranked.

## Prices and VAT
B2B only. Prices are shown **excl. btw** everywhere, with "Alle prijzen excl. btw" next to them. Stripe uses a fixed 21% tax rate, exclusive (`STRIPE_TAX_RATE_ID`); checkout refuses without it. If Vidalo ever sells to consumers, prices must be shown incl. btw and the B2C rules (withdrawal right) apply: flag before doing it.

## Personal data
See `docs/records-of-processing.md` and `docs/processors.md`. Cookies the app sets (all functional, no consent needed; no analytics yet):

| Name | Purpose | Lifetime |
|---|---|---|
| `sb-<ref>-auth-token` (Supabase) | Keeps the owner signed in | Session / refresh |
| `vidalo_google_state` | CSRF state during Google sign-in | 10 minutes |
| `vidalo_mock_session` | Development only (mock mode) | Session |

Browser storage: none. Fonts are self-hosted by Next (no Google Fonts request from the visitor). Adding any storage write or tracker means a row here and a cookie statement entry in the same change.

## DPIA screening (P3)
Vidalo processes business facts, mostly not personal data; owner emails and Google account ids are ordinary personal data; no special categories, no location tracking of people, no profiling of individuals, not large scale. **Screening outcome: a full DPIA is not indicated.** Re-screen if Vidalo starts monitoring people (e.g. sole traders at scale) or adds analytics.

## Open questions for counsel
1. Terms, privacy and a cookie statement from the De Boer Legal masters (B2B, July 2026) instead of the current drafts; routes `/legal/terms|privacy|cookies` in NL and EN.
2. Retention for free-check data and for closed accounts.
3. The privacy text says reminders stop "if you mail us"; there is now a one-click unsubscribe link. Update the sentence.
4. Hosting processors (Vercel, Fly/Railway) once chosen.
5. Whether "Wij zorgen dat het antwoord klopt" needs a qualifier next to it.
6. The EU AI Act: Vidalo uses AI providers to ask questions; it does not offer an AI system to the public. Confirm no transparency duty applies beyond saying which assistants we ask.
