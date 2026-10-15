# Vidalo — competitor design & positioning notes

Date: 2026-10-07. Method: every page below was loaded in a headless Chromium (Playwright, 1280px viewport) and a script extracted the rendered H1/subhead, visible CTAs with their computed background/colour/radius, headings in document order, computed `font-family` of H1/body/p, loaded font files, hero `<img>`/`<video>`/`<canvas>`/`<input>` elements, counts of gradient / large-blur / large-shadow elements, jargon word counts and visible prices. Otterly and Scrunch timed out in the browser run and were read as text only (no CSS data). ING Zakelijk returned an empty bot-wall page and is excluded. Colour values marked "(unreliable)" came back from pages that use modern colour syntax the extractor could not parse.

Quick legend for the visual counts: `grad` = elements with a CSS gradient background, `blur` = elements with `filter: blur(>20px)` (the "glow blob" tell), `shadow` = elements with a box-shadow ≥10px.

---

## Part A — Site-by-site record

### 1. Profound — https://www.tryprofound.com/
- **H1 (verbatim):** "The AI marketing platform to win in ChatGPT, Perplexity, Claude, Gemini, Microsoft Copilot, DeepSeek, Google AI Overviews, AI search platforms" (the platform names rotate; rendered DOM read "…win in ChatGPT AI search platforms").
- **Subhead:** "Multiply what you can accomplish with an AI Marketer trained on what consumers prompt, what agents cite, and the context only your teams have."
- **Primary CTA:** "Get a Demo" (white button `#ffffff` on black, text `#222222`, radius 8px). Secondary: "Get started" (`#333333`).
- **Hero visual:** large `<canvas>` animation of a product workspace ("w.Wrenfield" workspace with AI Marketer / Analytics / Projects / Agents / Sheets). No input field.
- **Section order:** hero → "See your AI Marketer at work" (product demo) → "Powering leading marketing teams" (logos: Plaid, MongoDB, Gr0, Ramp, Zoom with stats "50% increase in AI Search visibility", "7x increase in brand visibility") → "Your AI Marketer makes it possible" → "Underpinned by the context marketers need" → "Engineered for marketers with higher standards" → "Reinforced by every new data point" → "Enterprise capabilities trusted by a third of the Fortune 100" (RBAC, SCIM, SOC 2, 200+ integrations) → "Backed by industry-leading research" (linked studies) → closing CTA.
- **Mechanism explanation:** animated dashboard; feature tiles. Proof = customer stat cards + Fortune-100 claim + research links.
- **Pricing (https://www.tryprofound.com/pricing):** H1 "Meet your AI Marketer". Only two columns: **Trial (Free, 50 prompts daily for 7 days, 3 engines)** and **Enterprise (Custom)**. No public price. Long feature comparison table, FAQ about "credits". CTA "Get a Demo".
- **Visual tells:** Inter Variable everywhere (H1 48px/500, letter-spacing −1.08px); pure black background `#000000`, text `#edf2f5`; 48 gradient elements on home, 70 on pricing; canvas animation in hero; Next.js + Tailwind. Classic "dark enterprise AI" look.
- **Tone:** heavy jargon — AEO ×7, "answer engines" ×6, "AI Marketer", "agents", "citation decay", "superintelligent teammate".

### 2. Peec AI — https://peec.ai/
- **H1:** "AI search analytics for marketing teams"
- **Subhead:** "Track, analyze, and improve brand performance on AI search platforms through key metrics like Visibility, Position, and Sentiment"
- **Primary CTA:** "Start Free Trial" (`#171717` near-black, radius 6px). Secondary: "Talk to Sales".
- **Hero visual:** composed product screenshot (dashboard "Attio — Visibility trending up by 5.2% this month", competitor bars Salesforce 62% / Attio 47% / Monday 65%…). No input.
- **Section order:** hero → "Trusted by 3000+ brands and agencies" (logo wall split Brands / Agencies) → "AI Search Metrics — Understand how AI sees your brand" (Visibility / Position / Sentiment, illustrated with a mock ChatGPT answer "What are the best CRMs for Startups?") → "Key features — Turn AI search insights into new customers" (6 steps: Set up Prompts, Use Data to Pick Winners, Add Brands, Choose AI Models, Find Key Sources, Act on Insights) → testimonial (Lily Ray) → "Peec MCP is live" → "Create powerful reports" (Looker Studio, API, CSV) → prompt examples strip → testimonials → "Find out what AI says about your brand" CTA → FAQ.
- **Mechanism:** screenshot per step + an annotated fake AI answer with brand chips and scores. Proof: "3000+ brands", G2 4.7/5 in footer, named testimonials with photos and employer logos.
- **Pricing (https://peec.ai/pricing):** H1 "Pricing for Brands". Four self-serve tiers: **Starter $95/mo (50 prompts, 3 models, 1 project) · Pro $245/mo (150 prompts, 2 projects) · Advanced $495/mo (350 prompts, 5 projects, multi-country, Looker) · Enterprise custom (annual, SSO, API)**. Monthly/annual toggle, "Trusted by 3000+ brands" strip, long grouped feature matrix (Tracking Coverage / Discover / Measure / Act / Report), separate agency pricing page.
- **Visual tells:** Geist Variable (H1 64px, **weight 400**, −1.28px), light grey background `#f7f7f7`, black buttons, **218 gradient elements, 42 large shadows** (bento cards with soft gradients), Framer-built, HubSpot tracking. Light, airy, Linear-adjacent.
- **Tone:** "prompts" ×54, LLM ×3, GEO ×1 — product-feature jargon rather than acronyms.

### 3. Otterly.AI — https://otterly.ai/  (text only, browser load timed out)
- **H1:** "We otter know where your brand shows up on AI Search"
- **Subhead/intro:** "Do you know if AI is recommending you? Analyze how AI search engines mention, and cite your brand - across ChatGPT, Google AI Overviews, Claude, Perplexity, Google AI Mode, Gemini, and Copilot."
- **CTAs:** "Start for Free →", "Watch Video".
- **Hero visual:** embedded report mock ("Brand Report / Adidas / Overview … Report based on 200 prompts … Brand Coverage Over Time: Me + Top 5 competitors Nike, Adidas, New Balance…").
- **Section order:** hero report → "Trusted by 40,000+ Marketing Pros worldwide" → case-study tiles ("Demo from ChatGPT up 1% → 10%") → before/after quote ("From this: 'We have no idea how to improve our brand visibility on ChatGPT' → To this: '2x increase'") → "OtterlyAI is the Content Intelligence Platform for AI Search" (AI Prompt Research / AI Search Analytics / Content Audit / GEO Optimization / Multi-AI coverage) → "What Marketing Pros asked before they signed up" (question-led FAQ) → Gartner Cool Vendor 2025 + G2/OMR/Tekpon badges → GEO experiments (blog) → ~25 testimonials → FAQ → footer with free GEO tools.
- **Pricing (https://otterly.ai/pricing):** **Lite $29/mo (15 prompts) · Standard $189/mo (100 prompts, "Most Popular") · Premium $489/mo (400 prompts) · Enterprise custom.** Annual −15% ($25/$160/$422). Add-ons priced per engine (Claude +$29–$439/mo). Prompt calculator. FAQ "Are there any hidden fees?".
- **Visual tells (from copy):** otter mascot and puns ("Otterly Awesome", "paws on the keyboard", 🦦 emoji, ⚠️ emoji in pricing). Playful SMB SaaS tone.
- **Tone:** GEO used constantly; "Share of AI Voice"; but also plain questions ("Is AI recommending us - or our competitors?").

### 4. Promptwatch (Amsterdam) — https://promptwatch.io/
- **H1:** "Make AI Search your next revenue channel"
- **H2 directly under it:** "Track and optimize visibility in ChatGPT, Gemini and other AI Search engines to drive traffic to your website that converts."
- **Primary CTA:** "Start Free Trial" (deep purple `#2b1850`, white text, radius 6px). Secondary "Book a Demo" (white).
- **Hero visual:** two 848×445 product screenshots plus a large `<canvas>` (animated background). No input.
- **Section order:** hero → logo wall (Yelp, Duolingo, Typeform, BNP Paribas, Center Parcs, Monks…) → "See Promptwatch in action" (video) → "Everything you need to win in AI search" (6 feature tiles) → CDN/crawler-log integrations (Cloudflare, Fastly, Vercel) → "Create content that gets cited by AI" → "Our data tells the story with 26,520,900,000 citations, clicks, and prompts" → "Get real insights from real prompts" → "Know in real time when you are cited by ChatGPT" → "Real prompt data from real user interfaces" → "See exactly what offsite citations drive visibility" (Reddit, YouTube) → FAQ → "Be the brand AI recommends" CTA.
- **Proof:** logos, the 26.5-billion number, G2 4.7/5 star row (★ ★ ★ ★ ★ characters in text), "1,840+ brands".
- **Pricing (https://promptwatch.io/pricing):** eyebrow "4.7/5 stars on G2"; H1 "Turn AI search into growth". Tabs Brands / Agencies / Custom, currency toggle $/€. **Essential (~$95–130/mo, 50 prompts, 4 models) · Professional (150 prompts) · Business "Most Popular" (350 prompts, "Book a Demo")**, 7-day free trial on the lower two. Everything metered in "Agent Credits" and "AEO Articles/mo". Big feature matrix grouped Monitoring / AI Models / AI Agents / Integrations / Team & Access. Footer gives Amsterdam address (Kleine-Gartmanplantsoen 21) and **KVK 97074756**.
- **Visual tells:** Aeonik Pro headings (48px/500) + Geist body + Geist Mono; white page; 62 gradient elements, 7 big shadows; Next.js/Tailwind. "Clean SaaS with purple accent" — the most Linear/Vercel-flavoured of the set.
- **Tone:** very heavy — GEO ×8, LLM ×7, "share of voice" ×3, "AI visibility" ×13, "citations" ×24.

### 5. Scrunch AI — https://www.scrunchai.com/  (text only)
- **H1:** "Humans don't visit your website anymore— AI does."
- **Subhead:** "Scrunch gets your site AI-ready so you show up in answers, get cited, and grow revenue."
- **Primary CTA:** "Run AI visibility audit — See results in 30 seconds — No credit card required". Secondary "Book a demo", "Start a free trial".
- **Hero visual:** a URL-audit entry point (the CTA itself is the input), then an animated "AXP" demo that shows a fictional site ("Tyrell Nexus") being compressed into agent-readable HTML with a "98.9% token reduction" counter.
- **Section order:** hero → "Trusted by over 500 companies …and agencies" → "Web visits may fade. Revenue doesn't have to." → AXP explainer (Observe / Optimize / Deliver) → case stat "364% increase in brand presence for non-branded prompts" + quote → Monitoring & Citations → AI Search Trends → "Built for enterprise from the start" (SOC2, SAML, 6M+ citations weekly) → quote "4x growth" → press → "Get started in seconds — Run an AI visibility audit".
- **Pricing:** not captured (page timed out); home shows free trial + demo paths.
- **Tone:** enterprise, "agents", "AXP"; the 30-second audit input is the one SMB-friendly element.

### 6. AthenaHQ — https://www.athenahq.ai/
- **H1:** "Become the Brand AI Trusts"
- **Subhead/H2:** "See, Act, and Win on AI Search and Beyond". Hero contains an **email input** ("Enter your company email") with button "Get Free Audit (10m)".
- **Primary CTA:** "Start Now" / "Get Free Audit (10m)" — indigo `#4f39f6`, radius 8px.
- **Hero visual:** canvas animation + "Featured on" strip (Y Combinator, Forbes) + client logos (Coinbase, Hearst, HexClad, Nextiva, Slalom, SoFi).
- **Section order:** hero + logos → "Empowering Next-Gen Marketing Teams at" → "How Teams Use Athena" (role tabs: AEO/GEO manager, CMO, SEO, PR…) → "Control How AI Search Perceives Your Brand" → Gartner quote block ("50% of traditional search traffic will be replaced with generative AI by 2028") → "Pinpoint Websites Cited by ChatGPT" → "Identify Content Gaps and Take Action" → "Proven Across Industries, Trusted by Leaders" → Advisory Board / "Built with experience from" (Google, etc.) → inline pricing (Essential / Starter / Enterprise) → FAQ → "Ready to Lead the GenAI Revolution?"
- **Pricing (https://www.athenahq.ai/pricing):** **Essential: Free ($25 free credit, 300 credits) · Starter $295/mo (3,600 credits, 11 models, API as paid add-on) · Enterprise custom.** Monthly/Annual (17% off). Then a long matrix (Plan Essentials / Monitoring / Action / Organization) and G2 badge wall ("High Performer Spring 2026", "Users Love Us 4.9").
- **Visual tells:** Space Grotesk 72px **bold 700** headlines + Open Sans body 14px; off-white `#fbfbfb`; indigo buttons; 5 big-blur glows on home; typographic quote marks ❝ ❞; HubSpot. The most "YC AI startup" looking page.
- **Tone:** AEO ×13, GEO ×7, "AEO/GEO Manager Command Center", "GenAI Revolution".

### 7. Rankscale — https://rankscale.ai/
- **Eyebrow:** "Own Your AI Presence". **H1:** "The AI Visibility Platform"
- **Subhead:** "Rankscale tracks brand visibility across 17+ engines, including ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews, for agencies, enterprise, and SEO teams running Answer Engine Optimization (AEO) and GEO."
- **Primary CTA:** "Get Started" (dark green `#13492e`, **pill radius 9999px**); "Book a Demo" white pill.
- **Hero visual:** 1294×734 dashboard screenshot + large `<video>`.
- **Section order:** hero → logo wall (Bosch, Iberdrola, UBS, Cartier, Dentsu, WPP…) → "Every AI Engine, One Platform. No Upsell" → "The Complete Stack for AI Search Optimization" (10 feature tiles) → inline pricing (Essentials/Pro/Pro+/Growth/Enterprise) → "The Numbers Speak For Themselves" (1000+ users, 17+ engines) → testimonials → "Our Journey" (14-step company timeline!) → FAQ → CTA.
- **Pricing (https://rankscale.ai/pricing):** credit-based. **Pro $99/mo (1,200 credits) · Pro+ $229 · Growth $385 "Most Popular ⭐" · Enterprise $780 · Custom.** Yearly −15%. "✨ Try Pro free for 7 days". Credit calculator. Side-by-side matrix. "Rankscale GmbH contributes 1% of purchases to remove CO₂".
- **Visual tells:** Adobe Fonts "new-science" headings + Inter; warm off-white `#faf8f5`; **136 gradient elements, 19 large-blur glow blobs, 87 big shadows**; emoji 🔥 ✨ ⭐ in UI; Tailwind. The loudest "AI template" look of the set.
- **Tone:** AI visibility ×16, GEO ×7, AEO ×3, Copilot ×7, AI Overviews ×9.

### 8. Yext (Scout) — https://www.yext.com/ and https://www.yext.com/platform/scout
- **Home H1:** "Agents aren't the edge. It's you." Eyebrow (uppercase) "ENTERPRISE AGENTIC MARKETING PLATFORM". Subhead "Yext gives you the intelligence, shared context, and distribution to win." CTA "Get started" / "See Yext in action". Logo row in hero (OhioHealth, Campbell's…). "Trusted by global brands managing 9M+ locations worldwide".
- **Scout page:** eyebrow "AEO AND SEO VISIBILITY AGENT"; H1 "Act on your AI visibility across more sources"; subhead "Show up at every moment of discovery, in AI and traditional search, before competitors do."; CTA "Get a demo"; hero image 600×338 product still.
- **Scout section order:** hero → "See your full AI visibility picture" (3 tiles: Manage brand and location visibility / Prioritize what to fix / Agents get the job done) → "Track and close AI visibility gaps…" with **uppercase category eyebrows** (VISIBILITY MONITORING, LOCAL BENCHMARKING, COMPETITIVE BENCHMARKING, SENTIMENT ANALYSIS, CITATION TRACKING, ACTION CENTER, MOBILE APP), each a plain-language sentence ("Understand how AI describes your brand… uncover recurring themes (i.e. 'long wait times')") → customer quotes (MidFirst Bank) → FAQ (14 Qs) → resources → "See exactly how your brand appears in ChatGPT and Google for free".
- **Pricing:** none public; demo-led.
- **Visual tells:** proprietary "Yext Entity" typeface (H1 60px/500, −1.8px) + Figtree; buttons radius 8px; only 3–5 gradient elements, **zero blur glows**; left-aligned H1 at 600px max width. Colours could not be parsed reliably. Restrained corporate.
- **Tone:** AEO ×1, "AI visibility" ×6; otherwise plain. The sentiment example "long wait times" is a good model for concreteness.

### 9. Uberall — https://uberall.com/en-us
- **H1:** "Be the Brand Customers Choose. Everywhere They Search." Subhead "Make your locations the #1 choice across AI and local search. Turn digital presence into visits, trust, and revenue." CTA "GET YOUR DEMO" (uppercase).
- **Hero visual:** large SVG illustration; animated counters.
- **Section order:** hero → "Trusted by 1000+ Brands Worldwide to Win Locally" (Adidas, KFC, Shell, PostNL, Puma, M&S…) → "Everything You Need to Win Locally" (Listings / GEO Studio "The First Generative Engine Optimization Solution for Multi-Location Brands" / Reviews / Local Pages / Local Social) → stat strip (211%, 78%, 214%…) → "Why Operators, Marketers, and Execs Trust Uberall" (G2-style review headlines) → integrations → newsletter → CTA.
- **Visual tells:** **Tiempos Headline (serif) 54px bold** + IBM Plex Sans 18px; white; 181 gradient elements; Webflow + HubSpot. Serif headline is the one thing that separates it visually from the AI pack.
- **Tone:** GEO ×9 but zero LLM/AEO; the line "the accuracy, trust signals, and local context AI needs to select your locations" is closest to Vidalo's "fix at the source" idea.

### 10. Birdeye — https://birdeye.com/
- **H1:** "AI Coworkers for Multi-location Brands". Subhead "Win AI visibility, book appointments, and drive consistent CX at every location." Header CTA **"Check My AI Visibility"** (brown-grey `#4d403a`, pill). "Watch Demo".
- **Hero visual:** full-bleed lifestyle photos ("Parent and child looking up a nearby business on a phone"), white H1 56px/400 on dark photo.
- **Section order:** hero → "Meet your AI Coworkers" (named agents Jay / Myna / Robin with avatars) → "BirdAI, The Agent OS" → industries & integrations → "Trust and reliability" → "#1 on G2 in Enterprise" → footer.
- **Pricing (https://birdeye.com/pricing/):** H2 "Pricing built around outcomes, not seat counts." No numbers; a 4-field lead form (Business email, company, name, mobile) + "GET PRICING". "#1 on G2. Proven where it matters."
- **Visual tells:** Geist (Google Fonts) + Poppins; pill buttons radius 100px; no gradients, 15 big shadows; phone number in the nav (1 800…). Photo-led, US-SMB-platform look.

### 11. Citeerbaar (NL agency) — https://citeerbaar.nl/
- **Eyebrow:** "AI-vindbaarheid voor bedrijven die online gekozen willen worden"
- **H1:** "Je staat in Google. Maar sta je ook in ChatGPT? AI Overviews?"
- **Subhead:** "Klanten vragen ChatGPT, Copilot of Perplexity wie ze moeten kiezen, waar ze moeten zijn en welk aanbod bij hen past. Citeerbaar maakt jouw website duidelijker en beter bruikbaar als bron voor die antwoorden. We onderzoeken wat er ontbreekt en zetten de belangrijkste verbeteringen zelf live."
- **CTAs:** "Gratis Quick Check" (lime `#d8e63c`, text navy `#101127`, radius 10px, weight 900) and "Bekijk pakketten" (navy `#273287`). Micro-trust under buttons: "Werkt op vrijwel alle websites · Reactie binnen 2 werkdagen".
- **Hero visual:** rotating 608×1043 portrait photos of real-looking Dutch owners (alt: "Horeca-ondernemer werkt aan AI-vindbaarheid van haar website", winkelier, catering, boekwinkel). **Lead form right in the hero** (NAAM / E-MAILADRES / TELEFOONNUMMER / WEBSITE → "Vraag mijn Quick Check aan") with disclosure "De Quick Check is gratis. Een volledige Citeerbaar Scan is optioneel (€ 295 excl. btw)."
- **Section order:** hero+form → "De nieuwe manier van zoeken — Je klant zoekt niet meer alleen via Google" with a **sourced statistic** ("8,6 miljoen Nederlanders tussen 18 en 65 jaar gebruiken AI… Bron: Newcom, AI Monitor 2026") → 4 pillars (AI-vindbaarheid / Bedrijfsprofiel / Technische basis / Antwoordblokken) → "De AI-test — AI geeft maar een paar namen. Sta jij ertussen?" → **a mock AI answer block** ("VOORBEELD: EEN WEBSHOP · AI-ASSISTENT · JIJ VROEG: Welke webshop verkoopt dit product het beste? · ANTWOORD: Meestal verwijs ik naar een paar bekende shops… Voorbeeld ter illustratie. Geen live AI-resultaat") → packages (Scan / Fix / Sprint / Groei) → segments (Horeca, MKB, Webshops, Agencies, Events) → footer with **KvK 30215165, street address, phone 06…, "Over Ronald"**.
- **Visual tells:** Inter **weight 900 at 91px** (very heavy display) + IBM Plex Sans 17px body + Instrument Serif accents; warm paper background `#f0eee9`; lime/navy palette; WordPress + Tailwind; 16 gradients, 10 shadows, no glow blobs. Logos are local businesses (DOT Groningen, Boutique Hotel Scheepers, Pro VVE Beheer, Strandpaviljoen Zee en Zon).
- **Tone:** almost no acronyms (GEO ×2 only in footer nav), plain Dutch "je", concrete ("3 concrete punten", "binnen 2 werkdagen"). This is the closest existing analogue to Vidalo's audience and the mock-answer block is the exact idea proposed for Vidalo's hero — Vidalo must do it better (real answer, real wrong fact, visibly corrected).

### 12. Searchlab (Amsterdam) — https://searchlab.nl/
- **Eyebrow:** "AI IN JOUW SYSTEMEN". **H1:** "Online marketing bureau met een eigen AI-brein. In jouw systemen."
- **Subhead:** long paragraph ending "Vaste prijs vanaf €1.500/mnd."
- **CTA:** "PLAN EEN GROEI-ANALYSE →" (black `#0a0a0a`, **lime text `#aaff00`**, radius 2px, uppercase 700). "BEKIJK DE AI-DEMO". Star row "★★★★★ 4,7 op Google · 19 reviews".
- **Hero visual:** large SVG + iframe demo.
- **Section order:** hero → six quoted customer pains in cards ("ChatGPT noemt ons nooit.", "Google Ads kost veel en levert weinig.") each followed by what they do → "VERTROUWD DOOR 100+ BEDRIJVEN" (logos: European Sleeper, Lowlander Beer, Nederlands Film Festival) → long "Wat is Searchlab" paragraph with **prices in prose** (Focus €1.500, Start €3.000, Grow €4.000, Scale €5.000/maand, "altijd opzegbaar per maand") → "Vier teams. Vier rapporten. Geen synergie." (problem narrative) → founder quote → "Traditioneel bureau vs. Searchlab" comparison → process (Analyseren / Identificeren / Uitvoeren) → differentiators → "19 reviews. Gemiddeld 4,7 sterren." → "Gratis groei-analyse. Binnen 5 dagen 3 lekken in je setup."
- **Visual tells:** Outfit 58px/600 + Inter; white; black-and-acid-lime; square corners; 50 big shadows; HubSpot. Agency-energetic, uppercase labels.
- **Tone:** plain Dutch, customer-quote framing, concrete deliverables and days.

### 13. OpsCode (NL/BE agency) — https://opscode.nl/
- **Eyebrow:** "MAANDELIJKS OPZEGBAAR · LIVE DASHBOARD". **H1:** "AI-MARKETINGBUREAU DAT RANGSCHIKT." (uppercase, Geist, weight 900; typeset small with letter-spaced logotype "O p s C o d e").
- **Subhead:** "Het eerste AI-first marketing bureau voor MKB in Nederland en België. SEO + AEO + GEO + LLMO in één stack, gevonden in Google, ChatGPT, Claude, Perplexity en Gemini. Geen loze beloftes."
- **CTA:** "Plan strategy call" (navy `#0f172a`, radius 10px); "ANALYSE STARTEN", "ZIE CASE STUDY →". Pill chips SEO / AEO / GEO / LLMO.
- **Hero visual:** canvas animation + a **live-ticker strip** ("TAT2HOLICS · LIVE 695 KEYWORDS #1 … AMSTERDAM, NL · 11:16:37").
- **Section order:** hero → "VERTROUWD DOOR BEDRIJVEN DIE DATA BOVEN BELOFTES ZETTEN" (4 local clients: Tat2Holics Den Haag, Black Angels Fitness Zoetermeer, JLH Vloeren & Trappen, The Gym Amsterdam; plus "Premium plek beschikbaar") → "Lokaal sterk. Landelijk schaalbaar." → "De cijfers nu. Niet vorige maand." (**live KPIs "Real-time data via Supabase · auto-refresh elke 60s"**) → NL vs BE market split → "Geen marketing-bureau. Een marketing-product." (6 reasons, each with proof: "TRADITIONEEL 4 dagen per blogpost / MET OPSCODE 2 uur") → "Eén login. Alles wat jij ziet." (**fake dashboard rendered in HTML**, "Dit is geen screenshot: dit is wat draait") → "Van pagina 3 naar #1. In 6 maanden." → "Zeven stappen. Volledig zichtbaar." → "Eén aanpak, drie tiers" (Retail & Horeca / Dienstverlening / Hoog-LTV) with prices **€695, €1.295, €2.295 per maand + opzet €1.495–€3.995** → "Bewezen Resultaten" → testimonials → FAQ → "Eén gesprek, geen verplichtingen".
- **Visual tells:** Geist + Geist Mono; **dark/black page**, green `#22c55e` accents and "● LIVE" dots, uppercase mono labels, 52 gradients, 3 glow blobs, 17 shadows; Next.js + Tailwind; 18,206px tall (longest page in the set). "Terminal/dev-dashboard" aesthetic applied to SMB marketing.
- **Tone:** acronym-dense (AEO ×7, GEO ×6, LLMO) but direct Dutch ("Stop morgen. Geen contracten."). Note: typo in the rendered H1 ("DATRANGSCHIKT") — a reminder that uppercase display text is unforgiving.

### 14. Stripe — https://stripe.com/ and https://stripe.com/pricing
- **H1:** "Financial infrastructure to grow your revenue. Accept payments, handle business banking,¹ and implement custom revenue models—from your first transaction to your billionth." — note the **superscript footnote marker inside the H1**.
- **CTA:** "Get started" (indigo `#533afd`, radius 4px, weight 400) + "Sign up with Google". Eyebrow is a live counter "Global GDP running on Stripe: 1.728…%".
- **Section order:** hero → "Flexible solutions for every business model" → "Get Stripe product recommendations" (guided picker) → "The backbone of global commerce" (numbers) → "Powering businesses of all sizes" (Hertz, URBN "$5 billion", Instacart, Le Monde) → infrastructure → "What's happening" (news) .
- **Pricing page:** H1 "Pricing built for businesses of all sizes". Two cards only: **Standard — "2.9% + 30¢ per successful transaction for domestic cards … No setup fees, monthly fees, or hidden fees" · Custom — "available for businesses with large payments volume or unique business models" (IC+ pricing, volume discounts)**. Then "Features available out of the box" (195 countries, 135+ currencies), then "Standard pricing for all products" as a long per-product rate list.
- **Visual tells:** Söhne (sohne-var) 48px **weight 300** headline; indigo accent; 34 gradients (the famous hero wave), 20 big shadows but **no blur blobs**; body text `#425466` slate. H1 colour parsed as green (unreliable; the real hero is gradient-on-white).

### 15. Linear — https://linear.app/ and https://linear.app/pricing
- **H1:** "The product development system for teams and agents". Subhead "Purpose-built for planning and building products. Designed for the AI era." CTA "Sign up" (light pill `#e5e5e6` on dark, text `#08090a`).
- **Hero visual:** 1920×891 product screenshot rendered as a realistic issue view with live-looking activity ("Linear created the issue via Slack… 2min ago").
- **Section order (4 equal feature chapters):** hero → "A new species of product tool…" → "Intake and integrations" → "Planning and monitoring" → "AI and automations" → "Build, review, and ship" → "Changelog" → "Built for the future. Available today." Each chapter ~1,240px tall — strict rhythm.
- **Pricing:** H1 "Pricing" (one word, 48px). **Free $0 · Basic $10 per user/month · Business $16 per user/month · Enterprise custom**, all "Billed yearly". "Trusted by more than 40,000 companies". Full feature matrix with **"** Requires AI credits"** footnote and "View docs" link.
- **Visual tells:** Inter Variable weight **510** (optical), dark `#08090a`, text `#f7f8f8`, secondary `#8a8f98`, pill buttons; 59 gradients but **0 blur blobs**, 13 shadows; Berkeley Mono for code. Tight tracking −1.4px at 64px.

### 16. Mollie — https://www.mollie.com/ and https://www.mollie.com/pricing
- **H1:** "The platform for every payment" (rendered as two lines; "every payment" at 82px, Inter Variable weight 400, −2.4px). Subhead "Online and in-person payments, subscriptions, funding, reconciliation, and fraud prevention – so growth never means more providers." Eyebrow strip "POWERING GROWTH FOR OVER 250,000 BUSINESSES".
- **CTA:** "Get started now" (pill, radius 140px) / "Contact sales". Link colour is **pure `#0000ee` browser blue** — a deliberate "honest web" cue.
- **Section order:** eyebrow logos → hero → product pillars (Online / In-person / Capital / Business accounts) → customer stories → "Accept 38 payment methods – with one integration" → dashboard → "Built for high-volume businesses. Open to everyone." (6 founder quotes: Otrium, Veloretti, NUDIENT) → "Built by engineers to take the pain out of payments" → "Ask us anything, any time" → CTA.
- **Pricing:** H1 "Pricing to suit any business"; subhead "No minimum costs, no lock-in contracts, no hidden fees. With Mollie, you only pay for successful transactions." Two cards **Standard** (bullets: Access all features / Pay per transaction only / Cancel anytime / Easy setup) vs **Volume pricing** ("Process more than €100,000 a month?"). Then per-method list in a fixed grammar: "Mastercard — EEA Consumer Cards 1.80% + €0.25 · Commercial 2.90% + €0.25 · Non-EEA 3.25% + €0.25", "SEPA Direct Debit €0.35", in-person "Pay as you go €0/month" vs "Pro €20/month". Only 1 gradient element, 0 shadows on the pricing page.
- **Visual tells:** Framer; white; Inter at display sizes; near-zero decoration.

### 17. Moneybird — https://www.moneybird.nl/ and https://www.moneybird.nl/prijzen
- **H1:** "Boekhoudsoftware die slim voor je werkt." (Outfit Variable 60px/600, white on photo). Subhead row: "Gratis aanmelden · De visie van Moneybird · Meer dan 400.000 ondernemers gingen je voor".
- **CTA:** "Gratis aanmelden" / "Registreren" (blue `#0073e6`, radius 12px, weight 600).
- **Hero visual:** large photograph of a real person (file name "Moneybird_Merel_HQ_ShootTheRabbit") with the product cut out in front.
- **Section order:** hero → "Grip op je boekhouding. Rust in je hoofd." → "Software zo slim, dat het simpel voelt." → feature chapters (Facturen, Btw-aangifte, Inkoopfacturen) → "286.899 ondernemers gingen je voor." → bank account → "In 5 minuten zien hoe het werkt" (video) → integrations → support (Supportteam / Livesessies / Aangesloten experts) → "Blije ondernemers." (app-store style reviews) → "Continu in ontwikkeling" (changelog) → FAQ.
- **Pricing (/prijzen):** H1 "Betaal alleen voor wat je nodig hebt." Subhead mentions "Probeer het eerst 60 dagen gratis onbeperkt uit". Toggle "Betaal per jaar — Tot 25% korting". Tiers **Start. / Groei. ("Meest gekozen") / Compleet. / Compact.** Each card: audience line ("Ideaal voor freelancers en starters"), price per maand, **"Bespaar € 36 per jaar"** line, "Start gratis proefperiode", 3 benefits then hard limits ("20 verwerkte transacties · 1 gebruiker"). Then "Vergelijk alle pakketten" table and FAQ.
- **Visual tells:** Outfit + Inter Variable, blue/white, 1 gradient, radius 12px; Tailwind. Friendly Dutch SaaS; prices as "€ 7 per maand".

### 18. RDW — APK page — https://www.rdw.nl/particulier/voertuigen/auto/apk
- **H1:** "APK". Intro: "De APK (Algemene Periodieke Keuring) is een verplichte keuring voor voertuigen. Het hangt van het voertuig af wanneer en hoe vaak dit moet. Lees hier alles over de APK."
- **Structure:** a single search field ("Zoeken naar…"), then a plain grid of topic cards: "Over de APK", "Wanneer en hoe vaak APK keuren — Check direct de APK-datum", "Tips voor een veilig voertuig", "Voertuig in het buitenland en APK", "APK-keuringsrapport opvragen", "Niet eens met de goedkeuring APK", "Niet eens met afkeuring APK". 1,483px tall. No CTAs, no proof, no adjectives.
- **Visual tells:** Roboto Slab 36px/400 headings in navy `#121845` + Roboto body 20px; white; radius 5px; zero decoration. The vocabulary it owns — *keuring, goedkeuring, afkeuring, keuringsrapport, herinnering* — is a ready-made Dutch frame for Vidalo ("een APK voor wat AI over je bedrijf zegt").

---

## Part B — Synthesis

### 1. The common AI-visibility template (avoid these)

Counted across Profound, Peec, Otterly, Promptwatch, Scrunch, AthenaHQ, Rankscale (+ Yext/Uberall/Birdeye where noted):

1. **"The AI [Visibility|Search|Marketing] Platform" headline** naming 3–7 engines in the first sentence. Rankscale "The AI Visibility Platform", Peec "AI search analytics for marketing teams", Profound lists eight engines in the H1, Rankscale's subhead lists five. Readers who are not marketers do not know what "visibility platform" means.
2. **Dashboard-screenshot hero, centre-aligned, 48–64px headline.** Peec (composed dashboard), Rankscale (1294×734 screenshot + video), Promptwatch (two 848×445 screenshots), Profound (canvas product animation), Otterly (Adidas brand report). 6 of 7 product sites; only Scrunch and AthenaHQ put an input/email field in the hero.
3. **"Trusted by N+ brands/agencies" logo wall immediately under the hero.** Peec "3000+", Otterly "40,000+ Marketing Pros", Rankscale "1000+ active users", Promptwatch "1,840+", Scrunch "500 companies", Uberall "1000+ Brands", Yext "9M+ locations". The logos are US/enterprise SaaS (Plaid, Coinbase, Duolingo) that mean nothing to a Dutch garage owner.
4. **Credits / prompts / models as the pricing unit.** Peec (prompts × models × frequency), Promptwatch ("Agent Credits", "AEO Articles"), Rankscale (1,200 credits, "credit calculator"), AthenaHQ ("1 credit = 1 AI response"), Otterly ("search prompts", per-engine add-ons), Profound ("What are credits?" FAQ). Every one needs a calculator or FAQ to explain the unit — an anti-pattern for SMB.
5. **Three-to-five tier grid with a "Most Popular" badge, monthly/annual toggle, then a 100-row feature matrix.** Peec, Promptwatch, Rankscale, Otterly, AthenaHQ, Linear all do it. Entry prices cluster at **$95–$99/mo** (Peec $95, Promptwatch ~$95, Rankscale $99) with Otterly $29 and AthenaHQ free-with-credits as outliers.
6. **Acronym stacking: GEO / AEO / LLM / "share of voice" / "citations".** Promptwatch GEO ×8 + LLM ×7 + citations ×24; AthenaHQ AEO ×13; Rankscale "AI visibility" ×16; OpsCode "SEO + AEO + GEO + LLMO in één stack". Only Yext, Uberall, Birdeye (SMB/local platforms) avoid it.
7. **Gradient/glow décor and emoji badges.** Rankscale 136 gradients + 19 blur blobs + 🔥 ✨ ⭐; Peec 218 gradients; Profound 48–70; Promptwatch 62; AthenaHQ 5 blur blobs + ❝ ❞; Otterly 🦦 ⚠️. Contrast: Mollie pricing 1 gradient/0 shadows, Yext 0 blurs, Linear 0 blurs.
8. **Geist or Inter as the only typeface, weight 400–500, tight negative tracking.** Peec (Geist 400), Promptwatch (Aeonik + Geist), Profound (Inter), Birdeye (Geist), OpsCode (Geist), Searchlab (Outfit + Inter), Citeerbaar (Inter 900). Geist specifically now reads as "Vercel-template".
9. **Black or indigo/violet primary button, radius 6–8px, "Start Free Trial" + "Book a Demo" pair.** Peec `#171717`, Promptwatch `#2b1850`, AthenaHQ `#4f39f6`, Profound white-on-black, Stripe `#533afd`. Only Rankscale (green pill) and Citeerbaar (lime) differ.
10. **G2/Gartner badge strip + 10–25 scrolling testimonials from SEO managers.** Otterly (~25 quotes, Gartner Cool Vendor), AthenaHQ (three G2 awards), Promptwatch (4.7/5 G2 in the pricing eyebrow), Rankscale, Peec. Testimonials are from "Head of SEO", "VP SEO Strategy" — a persona Vidalo's buyer is not.
11. **Pages 13,000–18,000px tall** (Rankscale 15,469; Promptwatch 13,450; AthenaHQ 14,116; OpsCode 18,206; Citeerbaar 16,245) versus Yext 6,678, Linear 10,024, Mollie 8,194, RDW 1,483.

### 2. Most credible-looking sites and why

**Mollie (https://www.mollie.com/pricing)** — the pricing page has one gradient and zero shadows; two cards (Standard / Volume) with four verb-first bullets ("Access all features · Pay per transaction only · Cancel anytime · Easy setup"); every rate is written in one fixed grammar "1.80% + €0.25"; the headline promise is a negative list ("No minimum costs, no lock-in contracts, no hidden fees"); links are literal `#0000ee`. Inter at 78–82px with weight 400 (not bold) and −2.4px tracking gives scale without shouting. Nothing on the page needs explaining.

**Linear (https://linear.app/ and /pricing)** — one typeface (Inter Variable at weight 510), three greys (`#08090a` bg, `#f7f8f8` text, `#8a8f98` secondary), pill buttons in off-white. Section rhythm is mechanical: four feature chapters each ~1,240px, each a single H2 + one product frame. Pricing H1 is the single word "Pricing"; the plan cards state limits as nouns ("2 teams · 250 issues") and the matrix footnote "** Requires AI credits" handles the one complicated thing in six characters. Credibility comes from restraint and from the hero screenshot looking like real work (timestamps, names, "via Slack").

**Yext Scout (https://www.yext.com/platform/scout)** — among the AI-visibility pages this is the calmest: zero blur blobs, 3 gradients, left-aligned 60px H1 capped at 600px width, a proprietary typeface, and a section list driven by **uppercase category eyebrows** (VISIBILITY MONITORING / SENTIMENT ANALYSIS / CITATION TRACKING…) each followed by a one-sentence plain explanation with a concrete example ("recurring themes (i.e. 'long wait times')"). Proof is a named person at a named bank (Austin Robinson, MidFirst Bank) rather than a logo wall.

Honourable mentions: **Stripe pricing** for the two-card Standard/Custom pattern and the footnote discipline; **Moneybird /prijzen** for Dutch SMB pricing grammar ("Bespaar € 36 per jaar", "Meest gekozen", "Start gratis proefperiode", hard limits as the last line); **RDW** for owning the keuring vocabulary with no decoration at all.

### 3. Recommended visual direction for Vidalo (Dutch SMB owners)

**Positioning frame.** Not "AI visibility platform" but **"een keuring van wat AI over je bedrijf zegt"** — an inspection report with a fix. Borrow the APK mental model from RDW (keuring → rapport → goedgekeurd/afgekeurd → herstel), the plain-Dutch register of Citeerbaar/Moneybird, and the pricing honesty of Mollie. Visually it should look like a well-designed Dutch institution or accountancy tool, not a Vercel template.

**Typography (all on Google Fonts or system):**
- Headlines: **"Instrument Serif"** (Google Fonts) at 56–72px, weight 400, letter-spacing −0.5px, line-height 1.05. A serif immediately separates Vidalo from the Geist/Inter pack (only Uberall uses a serif, Tiempos, and it reads as the most "established" of the AI set). Use it only for H1/H2 and pull-quotes.
- Everything else: **"IBM Plex Sans"** 16–18px body, 500 for labels, 600 for buttons. Plex has a Dutch-institutional feel (used by Citeerbaar and Uberall) and renders diacritics well. Alternative pairing if a serif is rejected: "Fraunces" 500 for headlines + "Source Sans 3" body.
- Report/data elements: **"IBM Plex Mono"** 13–14px for the scan output (URLs, dates, "Gecontroleerd op 7 okt 2026 14:32", status codes). Mono signals "machine-read, not marketing".
- Never: Geist, Inter at display size, Space Grotesk bold, Outfit, uppercase letter-spaced H1s (see OpsCode's typo).

**Palette (light only; no dark mode marketing site):**
- Paper `#F6F4EE` page background (warmer than Peec's `#f7f7f7`, close to Citeerbaar `#f0eee9` and Rankscale `#faf8f5` but with less yellow).
- Ink `#15202B` for text and primary buttons.
- Secondary text `#5B6672`.
- Rule/border `#D9D4C7` (1px lines instead of shadows).
- Status colours used only inside the report, never as décor: **Afgekeurd / fout** `#B42318` on `#FDECEA`; **Twijfel / verouderd** `#A15C07` on `#FFF3DD`; **Goedgekeurd / klopt** `#1B6B3A` on `#E6F3EA`.
- One accent for links and the single primary action: **`#1F4FD8`** (a clear, almost "browser" blue, echoing Mollie's `#0000ee` honesty cue). No purple, no indigo, no lime.
- Button: ink background, paper text, radius **6px**, 15px/600 Plex Sans, 14px vertical padding. One primary button per view.
- No gradients, no blur blobs, no box-shadows larger than `0 1px 2px rgba(21,32,43,.08)`. Cards are 1px `#D9D4C7` borders on `#FFFFFF`.

**Hero structure (desktop 1200px container, 2 columns 5/7):**
- Left column (5/12): eyebrow in Plex Mono 13px uppercase ink-60% — "AI-CONTROLE VOOR BEDRIJVEN"; H1 Instrument Serif 64px: **"Wat zegt ChatGPT over jouw bedrijf? Klopt het?"**; subhead Plex Sans 19px, max 46ch: "Vidalo vraagt ChatGPT, Google AI en Copilot wat ze over je bedrijf weten, zet elke fout in een rapport en herstelt de bron waar de fout vandaan komt."; then the scan input (see below); under it a one-line trust row in 14px: "Eerste controle gratis · Resultaat binnen 2 minuten · Geen account nodig".
- Right column (7/12): the **wrong-fact answer card** (below). No screenshot of a dashboard anywhere above the fold.
- Height: the hero should finish by 760px; the first proof element must be visible without scrolling at 1366×768.

**The "real AI answer with the wrong fact" hero visual (build as live HTML, not an image):**
- A single card, white, 1px border, radius 8px, max 640px wide, that imitates the layout of a chat answer without copying any product's branding: a small circle avatar + label "ChatGPT · 7 okt 2026" in Plex Mono 12px; the question in Plex Sans 15px italic: *"Is Bakkerij De Vries in Haarlem op zondag open?"*; the answer in 16px Plex Sans with **one phrase highlighted** using the Afgekeurd style (`#FDECEA` background, 2px `#B42318` underline): "…is op zondag **geopend van 9:00 tot 17:00**…".
- A connector line (1px, `#B42318`, dashed) from the highlighted phrase to a second, smaller card directly below: label "GEVONDEN BRON" in mono, then "Openingstijden op bakkerijdevries.nl → zondag 09:00–17:00 (sinds 2023 gesloten op zondag)" and a status chip "Bron verouderd".
- A third row, the fix: chip "Hersteld 8 okt" in Goedgekeurd green with text "Openingstijden bijgewerkt op website en Google-bedrijfsprofiel. Hercontrole: 14 okt."
- Animate once on load (300ms fade in of the three rows in sequence); no loops, no typing effect, no cursor.
- Use fictional but plausible Dutch SMB examples (bakkerij, fysiotherapeut, autogarage, installateur) and rotate three static variants, never auto-rotating faster than 8s. Label it in 12px: "Voorbeeld van een controle. Echte rapporten tonen je eigen bedrijf."
- The same card component is reused in the real report, so the marketing promise and the product are visibly the same thing (this is what makes Linear's and OpsCode's "this is what runs" claims land).

**Scan input:**
- One field, not a form. Label (visible, above): "Bedrijfsnaam of website". Placeholder: "bijv. bakkerijdevries.nl". Height 52px, 1px ink border, radius 6px, Plex Sans 17px; button "Controleer gratis" attached to the right (ink). Width 100% of the left column.
- Below the field, Plex Mono 13px: "We vragen ChatGPT, Google AI Overviews en Copilot 12 standaardvragen over je bedrijf." Transparency about the mechanism replaces jargon.
- On submit, stay on the page: the right-hand card is replaced by a progress list in mono (✓ Bedrijf gevonden · ✓ ChatGPT gevraagd · … Copilot gevraagd) — the APK waiting-room feel. Never redirect to a signup before showing the first finding.
- Do not add email/phone/company fields here (Citeerbaar's 4-field hero form and Birdeye's 4-field pricing form are the thing to avoid). Ask for an email only to send the full report.

**Section order (keep the homepage under ~7,500px):**
1. Hero with input + wrong-fact card.
2. "Zo werkt een Vidalo-controle" — three numbered steps in a single row, each a 1px-bordered card with a mono step number: **01 Vragen** ("We stellen ChatGPT, Google AI en Copilot de vragen die je klanten stellen"), **02 Rapport** ("Elke uitspraak krijgt: klopt / verouderd / onjuist, met de bron"), **03 Herstel** ("We corrigeren de bron: je website, Google-bedrijfsprofiel, KvK-vermelding, Wikipedia…"). Use the report card component as the illustration, not icons.
3. "Een voorbeeldrapport" — one real-looking report page: header with company, date, score "7 van 12 antwoorden klopt", then rows. This replaces the dashboard screenshot.
4. Proof — three named Dutch businesses with city and trade ("Fysiotherapie Van Dijk, Zwolle") and one sentence each, with the before/after fact ("Oud telefoonnummer in Copilot → hersteld"). No logo wall until there are 12 recognisable Dutch names. Add one sourced statistic in the RDW/Citeerbaar manner with the source in mono beneath it.
5. Pricing (below).
6. FAQ, six questions max, in the owner's words ("Moet ik iets installeren?", "Hoe vaak controleren jullie?", "Wat als AI mijn concurrent noemt?").
7. Footer: KvK-nummer, btw-id, address, a real person's name, "Prijzen excl. btw".

**Pricing presentation:**
- H2 Instrument Serif: "Prijzen". Subhead: "Geen opzettermijn. Geen verborgen kosten. Maandelijks opzegbaar." (Mollie pattern.)
- **Two cards, not four** (Stripe/Mollie): **"Controle" — eenmalig €49 excl. btw** (één rapport, alle drie de AI-systemen, hersteladvies) and **"Bewaking" — €29 per maand excl. btw** (maandelijkse hercontrole, herstel aan de bron, melding bij nieuwe fouten). Third option as a text link only: "Meer dan 10 vestigingen? Neem contact op." Exact numbers are placeholders — the point is the structure: one-off vs. monthly, no credits, no prompts, no models.
- Card content order (Moneybird): audience line → price in Plex Mono 40px with "per maand" in 16px → three included items as full sentences → one hard limit line → button. Put "Eerste controle gratis" as a chip on the Controle card instead of a "Most Popular" badge.
- Footnotes under the cards in 13px with superscript markers (Stripe/Linear): "¹ Herstel op platforms van derden kan tot 14 dagen duren." Keep the whole pricing section inside one viewport; no feature matrix.

**What to avoid, specifically:**
- The words platform, visibility, GEO, AEO, LLM, prompts, credits, share of voice, citations anywhere on the marketing site. Say *controle, rapport, fout, bron, hersteld, hercontrole*.
- Dashboard screenshots, canvas animations, video heroes, live tickers (OpsCode), rotating hero photos (Citeerbaar).
- Logo walls of non-Dutch brands; G2 badges; emoji; star rows in text (★★★★★ as characters, as on Promptwatch and Searchlab).
- Dark mode marketing pages (Profound, Linear, OpsCode) — they read "developer tool", not "keuring".
- More than one accent colour; gradients; blur glows; shadows > 2px.
- Uppercase display headlines (OpsCode) and weight-900 display sans (Citeerbaar's 91px Inter Black).
- Four-field lead forms in the hero; "Book a demo" as a primary CTA.

### 4. Five micro-patterns worth borrowing (with source)

1. **Footnote markers inside the headline and plan cards** — Stripe's H1 carries a superscript "¹" after "business banking" (https://stripe.com/); Linear's pricing matrix closes with "** Requires AI credits — View docs" (https://linear.app/pricing). Use the same for Vidalo's "Herstel aan de bron¹" so caveats live next to the claim instead of in a FAQ.
2. **Negative-list pricing promise + one fixed rate grammar** — Mollie: "No minimum costs, no lock-in contracts, no hidden fees. With Mollie, you only pay for successful transactions." and every fee as "1.80% + €0.25" (https://www.mollie.com/pricing). Vidalo: "Geen opzettermijn, geen verborgen kosten, maandelijks opzegbaar" and every price as "€29 per maand excl. btw".
3. **Uppercase mono category eyebrow + one plain sentence + one concrete example** — Yext Scout's "SENTIMENT ANALYSIS — Understand how AI describes your brand… recurring themes (i.e. 'long wait times')" (https://www.yext.com/platform/scout). Vidalo: "OPENINGSTIJDEN — Klopt wat AI zegt over wanneer je open bent? (bijv. 'op zondag gesloten')".
4. **Dutch plan-card grammar** — Moneybird: audience line ("Ideaal voor freelancers en starters"), price "per maand", savings line "Bespaar € 36 per jaar", "Meest gekozen", button "Start gratis proefperiode", hard limits last ("20 verwerkte transacties · 1 gebruiker") (https://www.moneybird.nl/prijzen). Copy the order exactly; Dutch owners recognise it.
5. **Fixed-height feature chapters and a hero that is the real product state** — Linear's four homepage chapters are each ~1,240px with one H2 and one product frame, and the hero screenshot contains timestamps and real-looking activity ("Linear created the issue via Slack on behalf of Karri · 2min ago") (https://linear.app/). Vidalo: three equal-height sections, and the hero card shows a dated, sourced finding rather than an illustration. Related: OpsCode's "Dit is geen screenshot: dit is wat draait" (https://opscode.nl/) — render the example report in live HTML with the same component the product uses.

Bonus pattern from the Dutch set: Citeerbaar's sourced statistic with the source printed in full ("Bron: Newcom, AI Monitor 2026 (augustus 2026): 8,6 miljoen Nederlanders van 18 tot 65 jaar gebruiken AI", https://citeerbaar.nl/) and its footer transparency (KvK number, street address, founder name). Both are cheap credibility for a new Dutch BV.

---

## Appendix — extracted style table

| Site | Heading font / size / weight | Body font | Page bg | Primary button bg / radius | grad / blur / shadow | Hero media | Entry price |
|---|---|---|---|---|---|---|---|
| tryprofound.com | Inter Variable 48px 500 | Inter | `#000000` | `#ffffff` / 8px | 48 / 1 / 3 | canvas anim | Free trial → Enterprise |
| peec.ai | Geist Variable 64px 400 | Geist 13px | `#f7f7f7` | `#171717` / 6px | 218 / 1 / 42 | composed screenshot | $95/mo |
| otterly.ai | n/a (text only) | — | — | — | — | report mock | $29/mo |
| promptwatch.io | Aeonik Pro 48px 500 | Geist 16px | `#ffffff` | `#2b1850` / 6px | 62 / 1 / 7 | 2 screenshots + canvas | ~$95/mo |
| scrunchai.com | n/a (text only) | — | — | — | — | audit CTA + demo anim | trial/demo |
| athenahq.ai | Space Grotesk 72px 700 | Open Sans 14px | `#fbfbfb` | `#4f39f6` / 8px | 5 / 5 / 3 | canvas + email input | Free; $295/mo |
| rankscale.ai | new-science (Typekit) 30–56px 600 | Inter 14–16px | `#faf8f5` | `#13492e` / pill | 136 / 19 / 87 | screenshot + video | $99/mo |
| yext.com/platform/scout | Yext Entity 60px 500 | Yext Entity 16px | (unreliable) | radius 8px | 3 / 0 / 0 | product still 600×338 | demo |
| uberall.com | Tiempos Headline 54px 700 (serif) | IBM Plex Sans 18px | `#ffffff` | — (uppercase "GET YOUR DEMO") | 181 / 0 / 6 | SVG illustration | demo |
| birdeye.com | Geist 56px 400 | Geist 16px | photo hero | `#4d403a` / pill | 2 / 0 / 10 | lifestyle photos | lead form |
| citeerbaar.nl | Inter 91px 900 | IBM Plex Sans 17px | `#f0eee9` | `#d8e63c` / 10px | 16 / 0 / 10 | owner photos + 4-field form | €295 scan |
| searchlab.nl | Outfit 58px 600 | Inter 16px | `#ffffff` | `#0a0a0a` text `#aaff00` / 2px | 12 / 0 / 50 | SVG + iframe | €1.500/mnd |
| opscode.nl | Geist 900 uppercase | Geist 16px | `#030000` (dark) | `#0f172a` / 10px | 52 / 3 / 17 | canvas + live ticker | €695/mnd |
| stripe.com | Söhne 48px 300 | Söhne 16px | `#ffffff` (pricing `#f6f9fc`) | `#533afd` / 4px | 34 / 0 / 20 | gradient wave + bento | 2.9% + 30¢ |
| linear.app | Inter Variable 64px 510 | Inter 15px `#8a8f98` | `#08090a` | `#e5e5e6` / pill | 59 / 0 / 13 | product screenshot | $0 / $10 / $16 |
| mollie.com | Inter Variable 82px 400 | Inter 14px | `#ffffff` | pill, link `#0000ee` | 4 / 0 / 4 (pricing 1/0/0) | product image | 1.80% + €0.25 |
| moneybird.nl | Outfit Variable 60px 600 | Inter Variable 14–20px | `#ffffff` + photo | `#0073e6` / 12px | 6 / 0 / 12 | person photo + product | from "€ 7 per maand" |
| rdw.nl (APK) | Roboto Slab 36px 400 `#121845` | Roboto 20px | `#ffffff` | none | 1 / 0 / 0 | search field only | — |

Sources for every row: the URLs in Part A, rendered on 2026-10-07.
