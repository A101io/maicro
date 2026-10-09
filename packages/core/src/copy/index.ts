/**
 * All Dutch customer-facing copy for Maicro: web, result page, dashboard and
 * e-mail subjects. One file so wording stays consistent with docs/MESSAGING.md.
 *
 * Rules (see docs/CONTRACT.md): informal "je", no GEO/AEO/LLM/prompt/credits/
 * zichtbaarheid/platform, never claim control, calm verbs:
 * controleren · vinden · herstellen · laten zien.
 */

export const PRICES = {
  setupEur: 149,
  monitorEurPerMonth: 49,
} as const;

export const copy = {
  brand: "Maicro",
  tagline: "Je klanten vragen het aan ChatGPT. Wij zorgen dat het antwoord klopt.",
  engines: {
    chatgpt: "ChatGPT",
    google_ai: "Google AI",
    copilot: "Copilot",
    gemini: "Gemini",
    perplexity: "Perplexity",
  },

  nav: {
    how: "Zo werkt het",
    example: "Voorbeeldrapport",
    pricing: "Prijzen",
    faq: "Vragen",
    login: "Inloggen",
    dashboard: "Mijn overzicht",
    logout: "Uitloggen",
  },

  landing: {
    hero: {
      eyebrow: "AI-controle voor bedrijven",
      h1: "Klopt wat ChatGPT over je bedrijf zegt?",
      sub: "Je klanten vragen het aan AI. Wij controleren elke maand wat ChatGPT, Google en Copilot antwoorden en herstellen fouten bij de bron.",
      fieldLabel: "Bedrijfsnaam of website",
      placeholder: "bijv. bakkerijdevries.nl",
      button: "Controleer gratis",
      mechanism: "We stellen ChatGPT, Google AI en Copilot 6 standaardvragen over je bedrijf, elk 3 keer.",
      trust: ["Eerste controle gratis", "Resultaat binnen 2 minuten", "Geen account nodig"],
      exampleLabel: "Voorbeeld van een controle. Echte rapporten tonen je eigen bedrijf.",
    },
    shift: {
      h2: "Je klanten googelen niet meer. Ze vragen.",
      body: "45% van de Nederlanders gebruikt AI. 1 op de 5 begint een aankoop met een vraag aan ChatGPT. Ze krijgen één antwoord, geen tien links.",
      stat: "8,6 miljoen",
      statLabel: "Nederlanders van 18 tot 65 jaar gebruiken AI",
      statSource: "Bron: Newcom, AI Monitor 2026 (augustus 2026)",
    },
    changed: {
      h2: "Wat is er veranderd?",
      body: "Vroeger zocht je klant en koos zelf uit tien links. Nu stelt hij een vraag aan ChatGPT of Google en krijgt één antwoord. Binnenkort laat hij de AI ook kiezen, reserveren en bestellen.",
      closing: "Die AI kent jou alleen van wat het online vond. Of dat klopt, weet niemand. Behalve als je het controleert.",
      panels: [
        { year: "2015", title: "Zoeken", line: "10 links, jij kiest" },
        { year: "2026", title: "Vragen", line: "1 antwoord" },
        { year: "2027", title: "Vragen", line: "De AI regelt het" },
      ],
      agent: "Vandaag beantwoordt AI vragen. Binnenkort regelt AI dingen: reserveren, een offerte aanvragen, bestellen. Zo'n AI heet een agent. Als die denkt dat je dicht bent, belt hij niet.",
    },
    damage: {
      h2: "Bij de helft van de bedrijven klopt het antwoord niet.",
      body: "In een controle van 10.000 bedrijven gaf ChatGPT bij 1 op de 3 een verkeerd telefoonnummer. Een boekwinkel werd “permanent gesloten” genoemd en had een maand bijna geen omzet. De eigenaar hoort het als laatste.",
      stat: "1 op de 3",
      statLabel: "bedrijven krijgt van ChatGPT een verkeerd telefoonnummer",
      statSource: "Bron: Maicro, controle van 10.000 Nederlandse bedrijven (2026)",
    },
    noDesk: {
      h2: "Je kunt het antwoord niet aanpassen. Wel de bronnen.",
      body: "AI bouwt zijn antwoord uit Wikipedia, oude gidsen, nieuwsberichten en een bedrijf met dezelfde naam. Er is geen loket. De enige weg is: vind de bron, herstel de bron.",
    },
    how: {
      h2: "Zo werkt Maicro",
      steps: [
        { n: "01", title: "Vastleggen", body: "Je gegevens één keer goed: adres, telefoon, openingstijden, wat je wel en niet doet." },
        { n: "02", title: "Publiceren", body: "Een feitenpagina op je eigen domein, gesynchroniseerd met Google, Bing, Apple en de Nederlandse gidsen." },
        { n: "03", title: "Controleren", body: "Elke maand stellen we ChatGPT, Google AI en Copilot in het Nederlands de vragen die je klanten stellen." },
        { n: "04", title: "Herstellen", body: "Elke fout met bron. Hersteld waar het kan, aangeschreven waar het moet, met bewijs." },
      ],
    },
    exampleReport: {
      h2: "Een voorbeeldrapport",
      intro: "Dit is geen schermafbeelding. Dit is het rapport zoals je het krijgt, met een fictief bedrijf.",
    },
    proof: {
      h2: "Wat we vonden en herstelden.",
      label: "voorbeeld",
      cards: [
        { business: "Bakkerij De Vries, Haarlem", before: "ChatGPT: “gesloten op maandag”", after: "nu: open 9–18", source: "Bron: openingstijden.nl, hersteld in 12 dagen." },
        { business: "Fysiotherapie Van Dijk, Zwolle", before: "Copilot: oud telefoonnummer", after: "nu: 038 – 423 11 90", source: "Bron: oude gidsvermelding, hersteld in 9 dagen." },
        { business: "Installatiebedrijf Hendriks, Breda", before: "Google AI: “doet geen warmtepompen”", after: "nu: warmtepompen sinds 2022", source: "Bron: eigen website, hersteld in 3 dagen." },
      ],
    },
    pricing: {
      h2: "Prijzen",
      sub: "Geen opzegtermijn. Geen verborgen kosten. Maandelijks opzegbaar.",
      exclVat: "Alle prijzen excl. btw",
      freeChip: "Eerste controle gratis",
      setup: {
        name: "Instellen",
        audience: "Voor wie één keer alles goed wil zetten.",
        price: "€149",
        unit: "eenmalig",
        includes: [
          "Een feitenpagina op je eigen domein, met datum.",
          "Synchronisatie met Google, Bing, Apple en de Nederlandse gidsen.",
          "Een eerste herstelronde van alle gevonden fouten.¹",
        ],
        limit: "1 vestiging · eenmalige betaling",
        button: "Instellen – €149",
      },
      monitor: {
        name: "Bewaking",
        audience: "Voor wie wil dat het blijft kloppen.",
        price: "€49",
        unit: "per maand",
        includes: [
          "Elke maand een nieuwe controle bij ChatGPT, Google AI en Copilot.",
          "Herstel aan de bron bij elke nieuwe fout.¹",
          "Een maandelijks rapport met bewijs van wat er is hersteld.",
        ],
        limit: "1 vestiging · maandelijks opzegbaar · instellen €149 eenmalig",
        button: "Instellen + bewaking",
        mostChosen: "Meest gekozen",
      },
      footnote: "¹ Herstel op platforms van derden kan tot 14 dagen duren.",
      multi: "Meer dan 10 vestigingen? Neem contact op.",
    },
    faq: {
      h2: "Vragen",
      items: [
        { q: "Ik heb toch een website?", a: "Ja, en AI leest die ook. Maar het antwoord wordt gebouwd uit alles wat er online over je staat: oude gidsen, een nieuwsbericht van jaren geleden, een bedrijf met dezelfde naam. Wij controleren wat daaruit komt en herstellen wat niet klopt." },
        { q: "Kunnen jullie ChatGPT laten zeggen wat ik wil?", a: "Nee. Niemand kan dat. Wij herstellen de bronnen waar het antwoord uit komt. Daarna verandert het antwoord vanzelf mee." },
        { q: "Werkt het altijd?", a: "Antwoorden met zoekfunctie herstellen we binnen weken. Antwoorden uit het geheugen van het model veranderen pas bij een nieuwe modelversie. Dat zeggen we er eerlijk bij in het rapport." },
        { q: "Wat moet ik zelf doen?", a: "Vijf minuten: je gegevens bevestigen, één DNS-regel toevoegen en één keer inloggen bij Google. De rest doen wij." },
        { q: "Moet ik iets installeren?", a: "Nee." },
        { q: "Hoe vaak controleren jullie?", a: "Elke maand, en na elke wijziging." },
      ],
    },
    closing: {
      h2: "Vraag het ChatGPT. Of laat ons het doen.",
      button: "Gratis AI-check",
    },
    footer: {
      kvk: "KvK [nummer]",
      vat: "btw-id [nummer]",
      address: "[straat en nummer], [postcode plaats]",
      person: "[naam van een echt persoon]",
      exclVat: "Prijzen excl. btw",
      privacy: "Privacy",
      terms: "Voorwaarden",
    },
  },

  scan: {
    title: "We controleren je bedrijf",
    steps: {
      resolving: "Bedrijf zoeken",
      found: "Bedrijf gevonden",
      asking: (engine: string) => `${engine} gevraagd`,
      comparing: "Antwoorden vergelijken",
      sources: "Bronnen opzoeken",
      done: "Rapport klaar",
    },
    waiting: "Dit duurt meestal minder dan twee minuten.",
    failed: "De controle is niet gelukt. Probeer het nog een keer.",
    retry: "Opnieuw proberen",
    toReport: "Bekijk het rapport",
    choose: {
      title: "Welk bedrijf bedoel je?",
      body: "We vonden meer dan één bedrijf met deze naam. Kies de juiste.",
      button: "Dit bedrijf",
      none: "We konden geen bedrijf vinden. Probeer de website of de plaatsnaam erbij.",
      placeLabel: "Plaats",
      placeHint: "In welke plaats zit het bedrijf?",
      back: "Terug",
    },
    empty: "Vul een bedrijfsnaam of website in.",
  },

  result: {
    title: (business: string, date: string) => `Dit zegt AI over ${business}, gecontroleerd op ${date}`,
    summary: (total: number, wrong: number) =>
      wrong === 0
        ? `We stelden ${total} vragen aan ChatGPT, Google AI en Copilot. Alle antwoorden klopten.`
        : `We stelden ${total} vragen aan ChatGPT, Google AI en Copilot. ${wrong} ${wrong === 1 ? "antwoord klopte" : "antwoorden klopten"} niet.`,
    summaryIntro: (total: number) => `We stelden ChatGPT, Google AI en Copilot dezelfde vragen, meerdere keren: ${total} antwoorden.`,
    summaryAllOk: "Alle antwoorden klopten.",
    summaryCount: (wrong: number) => `${wrong} ${wrong === 1 ? "antwoord klopte" : "antwoorden klopten"} niet.`,
    /** Headline when AI barely knows the business (visibility "unknown"). */
    summaryUnknown: (name: string) => `AI vindt (bijna) niets over ${name}. Je bestaat niet in het antwoord.`,
    /** Headline when a good share of the answers came back empty (visibility "partial"). */
    summaryPartial: (name: string) => `AI kent ${name} maar half. Een deel van de antwoorden is leeg.`,
    notFoundCount: (n: number) => `${n} ${n === 1 ? "antwoord" : "antwoorden"}: niet gevonden.`,
    visibility: {
      found: "Gevonden",
      partial: "Deels gevonden",
      unknown: "Niet gevonden",
    },
    card: {
      question: "Vraag",
      said: (engine: string) => `${engine} zei`,
      wrong: "Klopt niet",
      source: "Waar het vandaan komt",
      action: "Wat we doen",
      foundSource: "Gevonden bron",
      frequency: (n: number, of: number) => `${n} van ${of} keer`,
      noSource: "Geen bron gevonden: dit komt uit het geheugen van het model.",
      saidNotFound: "AI zei: niets gevonden",
      notFoundAnswer: "niets gevonden",
    },
    correctCollapsed: (n: number) => `${n} ${n === 1 ? "antwoord klopte" : "antwoorden klopten"}. Toon`,
    showAll: (n: number) => `Toon alle ${n} fouten`,
    enginesRow: "Per AI",
    engineSkipped: "overgeslagen",
    engineNotFound: "niet gevonden",
    consequence: "Een klant die dit vraagt, krijgt dit antwoord. Niet één keer: elke keer, tot de bron verandert.",
    cta: {
      h3: "Laat Maicro de bronnen herstellen",
      body: "We zetten je gegevens goed, publiceren een feitenpagina en herstellen elke gevonden fout bij de bron.",
      setup: "Instellen – €149 eenmalig",
      monitor: "Instellen + bewaking – €149 + €49 per maand",
      exclVat: "Prijzen excl. btw. Geen opzegtermijn.",
    },
    selfFix: {
      summary: "Zelf oplossen? Dit zijn de bronnen.",
      intro: "Je kunt elke bron zelf aanschrijven of aanpassen. Dit is wat er moet veranderen:",
    },
    share: {
      label: "Deel dit rapport",
      note: "Deze link werkt 30 dagen.",
      copy: "Kopieer link",
      copied: "Gekopieerd",
    },
    email: {
      h3: "Stuur dit rapport naar mij",
      label: "E-mailadres",
      placeholder: "naam@bedrijf.nl",
      button: "Verstuur",
      sent: "We sturen het rapport naar je e-mailadres.",
      invalid: "Vul een geldig e-mailadres in.",
    },
    notFound: "Dit rapport bestaat niet of is verlopen.",
  },

  sourceType: {
    owned_facts_page: "je feitenpagina",
    owned_website: "je eigen website",
    directory_api: "bedrijfsgids",
    directory_form: "bedrijfsgids",
    third_party: "website van een derde",
    other_entity: "bedrijf met dezelfde naam",
    none: "geheugen van het model",
  },

  /** Fix path for a not_found finding (there is no wrong source; we make the business findable). */
  fixPathNotFound: "We maken een feitenpagina die AI kan lezen, zetten je in Google, Bing, Apple en de Nederlandse gidsen, en controleren na 3 weken of je genoemd wordt.",

  fixPath: {
    owned_facts_page: "We publiceren je feitenpagina opnieuw en melden de wijziging aan. Hercontrole na 7 dagen.",
    owned_website: "We sturen je precies welke pagina en welke tekst op je website moet veranderen. Hercontrole na 14 dagen.",
    directory_api: "We synchroniseren je gegevens opnieuw met deze gids. Hercontrole na 7 dagen.",
    directory_form: "We dienen een correctie in bij deze gids en bewaren het bewijs. Hercontrole na 14 dagen.",
    third_party: "We sturen namens jou een correctieverzoek naar deze website. Hercontrole na 30 dagen.",
    other_entity: "We zetten op je feitenpagina en in de gidsen duidelijk dat dit een ander bedrijf is. Hercontrole na 30 dagen.",
    none: "Hier is geen bron om te herstellen. We controleren opnieuw bij een nieuwe versie van het model.",
  },

  factKey: {
    existence: "Open of gesloten",
    hours: "Openingstijden",
    phone: "Telefoonnummer",
    address: "Adres",
    website: "Website",
    service: "Diensten",
    price: "Prijzen",
    policy: "Afspraken",
    payment: "Betalen",
    area: "Werkgebied",
    urgency: "Spoed en beschikbaarheid",
    credential: "Erkenningen",
    identity: "Naamgenoot",
  },

  /** The twelve criteria (docs/CRITERIA.md), by id. */
  criteria: {
    1: "Bestaan",
    2: "Telefoonnummer",
    3: "Openingstijden",
    4: "Werkgebied",
    5: "Spoed en beschikbaarheid",
    6: "Diensten: wel",
    7: "Diensten: niet",
    8: "Adres en locatie",
    9: "Prijzen en tarieven",
    10: "Afspraken en voorwaarden",
    11: "Identiteit en naamgenoot",
    12: "Erkenningen en kwalificaties",
  },

  /** Severity classes: one wrong answer and the customer does not come / comes for the wrong thing / confuses you with another. */
  severity: {
    afhaker: "Afhaker",
    misleider: "Misleider",
    verwarring: "Verwarring",
  },
  severityExplain: {
    afhaker: "Eén fout en de klant komt niet.",
    misleider: "De klant komt wel, maar voor het verkeerde.",
    verwarring: "AI haalt je door elkaar met een ander of mist waar je voor staat.",
  },

  /** The colour of the dot. */
  stip: {
    rood: "Rood",
    oranje: "Oranje",
    groen: "Groen",
    grijs: "Grijs",
  },
  stipMeaning: {
    rood: "AI stuurt klanten weg",
    oranje: "AI misleidt",
    groen: "Klopt",
    grijs: "AI kent je niet",
  },
  stipLine: {
    rood: "Minstens één antwoord stuurt klanten weg. Dat herstellen we eerst.",
    oranje: "Geen afhakers, maar de klant krijgt wel verkeerde details.",
    groen: "Alles wat we controleerden klopt.",
    grijs: "AI vindt (bijna) niets over je. Je bestaat niet in het antwoord.",
  },
  instable: "Instabiel",
  instableLine: "Dit antwoord klopte af en toe niet. Te zelden om te herstellen; we houden het in de gaten.",
  /** Recommendation questions: the business was not named where its facts say it belongs. */
  recommendation: {
    label: "Aanbevelingsvraag",
    absent: "niet genoemd",
    line: "Je wordt niet genoemd, terwijl dit bij je klopt.",
    noSource: "Geen bron: dit gegeven staat nergens waar AI het kan lezen.",
    note: "We beoordelen niet op welke plek je staat, alleen of je ten onrechte ontbreekt.",
  },

  /** Sector labels, by slug. */
  sectors: {
    "loodgieters-installateurs": "Loodgieters en installateurs",
    "aannemers-dakdekkers-schilders": "Aannemers, dakdekkers, schilders en hoveniers",
    "vve-beheer": "VvE-beheer en vastgoedbeheer",
    "zorg-praktijken": "Fysio, tandarts, huisarts, dierenarts en psycholoog",
    horeca: "Horeca",
    winkels: "Winkels",
    "garages-fietsenmakers": "Garages en fietsenmakers",
    "kappers-schoonheid": "Kappers, schoonheid en wellness",
    "advocaten-notarissen-accountants": "Advocaten, notarissen en accountants",
    "makelaars-hypotheek": "Makelaars en hypotheekadviseurs",
    "kinderopvang-sport-rijscholen": "Kinderopvang, sportscholen en rijscholen",
  },
  sectorLabel: "Sector",
  sectorHint: "Bepaalt welke extra vragen we stellen. Afgeleid van je Google-categorie; pas aan als het niet klopt.",
  sectorNone: "Geen sector (alleen de basisvragen)",

  findingVerdict: {
    wrong: "Klopt niet",
    not_found: "Niet gevonden",
  },

  findingStatus: {
    open: "Gevonden",
    fixing: "In behandeling",
    recheck: "Hercontrole",
    resolved: "Hersteld",
    unfixable: "Niet te herstellen",
  },

  channelStatus: {
    pending: "Wacht",
    synced: "Gelijk",
    mismatch: "Wijkt af",
    failed: "Mislukt",
    manual: "Handmatig",
  },

  checkout: {
    mockNotice: "Betaling gesimuleerd (geen Stripe-sleutel ingesteld).",
  },

  welcome: {
    h1: "Welkom bij Maicro",
    body: "Je betaling is gelukt. Vier dingen, dan zijn we binnen 48 uur live.",
    steps: [
      { title: "Bevestig je gegevens", body: "Controleer adres, telefoon, openingstijden en wat je wel en niet doet.", href: "/app/gegevens", cta: "Gegevens bevestigen" },
      { title: "Kies je domein", body: "Eén DNS-regel op je eigen domein, of laat Maicro een domein registreren.", href: "/app/domein", cta: "Domein instellen" },
      { title: "Log één keer in bij Google", body: "Zo kunnen we je Google-bedrijfsprofiel lezen en bijwerken.", href: "/app/google", cta: "Inloggen bij Google" },
      { title: "Wacht op de eerste controle", body: "Daarna krijg je elke maand een rapport. Je hoeft niets te installeren.", href: "/app", cta: "Naar je overzicht" },
    ],
    loginHint: "Je ontvangt een inloglink per e-mail. Geen wachtwoord nodig.",
  },

  auth: {
    h1: "Inloggen",
    body: "Vul je e-mailadres in. Je krijgt een link waarmee je direct bent ingelogd.",
    label: "E-mailadres",
    button: "Stuur inloglink",
    sent: "We hebben je een inloglink gestuurd. Kijk in je mailbox.",
    mockHint: "Geen Supabase-sleutels ingesteld: je wordt direct ingelogd in de voorbeeldomgeving.",
    noBusiness: "We vonden geen bedrijf bij dit e-mailadres. Start met een gratis controle.",
  },

  dashboard: {
    h1: "Overzicht",
    statusLine: (ok: number, total: number) => `${ok} van ${total} antwoorden kloppen`,
    checkNow: "Controleer nu",
    checkQueued: "Controle ingepland. Je ziet het resultaat hier binnen een uur.",
    sections: {
      status: "Status",
      findings: "Gevonden fouten",
      channels: "Bronnen die we bijhouden",
      proof: "Hersteld",
      setup: "Instellen",
      billing: "Facturen",
    },
    setupSteps: {
      facts: "Gegevens",
      domain: "Domein",
      google: "Google",
    },
    stepDone: "Klaar",
    stepTodo: "Nog te doen",
    noFindings: "Nog geen fouten gevonden.",
    noChannels: "Nog geen bronnen gekoppeld. Bevestig eerst je gegevens.",
    nextStep: "Volgende stap",
    invoices: "Facturen en abonnement",
    invoicesBody: "Bekijk facturen, wijzig je betaalgegevens of zeg op.",
    openPortal: "Open facturen",
    lastScan: (date: string) => `Laatste controle: ${date}`,
    noScan: "Nog geen controle uitgevoerd.",
    viewReport: "Rapport bekijken",
    factsPage: "Feitenpagina bekijken",
  },

  facts: {
    h1: "Je gegevens",
    intro: "Dit is wat we overal publiceren. Controleer het één keer goed.",
    provisionalNotice: "Deze gegevens hebben we van je website en Google gehaald. Ze zijn nog niet bevestigd.",
    verifiedNotice: (date: string) => `Bevestigd op ${date}.`,
    groups: {
      basics: "Bedrijf",
      contact: "Contact",
      hours: "Openingstijden",
      services: "Diensten",
      prices: "Prijzen",
      policies: "Afspraken",
      payment: "Betalen",
      confusion: "Niet te verwarren met",
      area: "Werkgebied",
      urgency: "Spoed en beschikbaarheid",
      credentials: "Erkenningen",
      sector: "Sector",
    },
    fields: {
      name: "Bedrijfsnaam",
      place: "Plaats",
      address: "Adres",
      postcode: "Postcode",
      phone: "Telefoonnummer",
      email: "E-mailadres",
      website: "Website",
      openStatus: "Status",
      openStatusOptions: { open: "Open", temporarily_closed: "Tijdelijk gesloten", permanently_closed: "Permanent gesloten" },
      servicesYes: "Dit doen we wel",
      servicesNo: "Dit doen we niet",
      prices: "Prijzen",
      priceLabel: "Omschrijving",
      priceAmount: "Bedrag",
      priceUnit: "Eenheid",
      policies: "Afspraken",
      policiesHint: "bijv. Alleen op afspraak, Pinnen mogelijk",
      paymentMethods: "Betaalmethoden",
      notConfusedWith: "Niet te verwarren met",
      notConfusedWithHint: "bijv. Bakkerij De Vries in Hoofddorp",
      serviceAreaPlaces: "Plaatsen waar je komt",
      serviceAreaPlacesHint: "bijv. Heemstede, Hoofddorp",
      serviceAreaRadiusKm: "Of een straal in kilometers",
      urgencyAvailable: "Spoeddienst of direct beschikbaar",
      urgencyHours: "Wanneer",
      urgencyHoursHint: "bijv. 24 uur per dag, 7 dagen per week",
      credentials: "Erkenningen en kwalificaties",
      credentialsHint: "bijv. Erkend installateur, BIG-registratie, NVM-lid",
      sector: "Sector",
      closed: "Gesloten",
      open: "Open",
      close: "Dicht",
      addItem: "Toevoegen",
      remove: "Verwijderen",
    },
    days: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"],
    submit: "Gegevens bevestigen",
    saved: "Gegevens bevestigd. We publiceren je feitenpagina en werken de bronnen bij.",
  },

  domain: {
    h1: "Je domein",
    intro: "Je feitenpagina komt op een subdomein van je eigen website, zodat AI ziet dat de informatie van jou komt.",
    optionA: "Op mijn eigen domein",
    optionAHint: "Voeg deze DNS-regel toe bij je domeinbeheerder:",
    recordType: "Type",
    recordName: "Naam",
    recordValue: "Waarde",
    checkButton: "Controleer DNS",
    verified: (host: string) => `${host} wijst naar Maicro. Je feitenpagina is live.`,
    notYet: "We zien de DNS-regel nog niet. DNS-wijzigingen kunnen tot een uur duren. We controleren elke 10 minuten opnieuw.",
    optionB: "Laat Maicro een domein registreren",
    optionBHint: (name: string) => `We registreren ${name} en richten alles in. Je hoeft niets te doen.`,
    optionBButton: "Registreer voor mij",
    optionBQueued: "We registreren het domein en laten je weten als het live is.",
    noDomain: "We kennen je website nog niet. Vul die eerst in bij je gegevens.",
  },

  google: {
    h1: "Google-bedrijfsprofiel",
    intro: "Log één keer in bij Google. Dan kunnen we je openingstijden, telefoonnummer en website lezen en bijwerken.",
    button: "Inloggen bij Google",
    connected: (date: string) => `Gekoppeld op ${date}.`,
    disconnected: "Nog niet gekoppeld.",
    mockHint: "Geen Google-sleutels ingesteld: de koppeling wordt gesimuleerd.",
    permissions: "We vragen alleen toegang tot je bedrijfsprofiel, niet tot je e-mail of andere Google-diensten.",
  },

  factsPage: {
    title: (name: string, place: string) => `${name}, ${place}: feiten`,
    updated: (date: string) => `Bijgewerkt op ${date}`,
    verified: "Bevestigd door de eigenaar",
    sections: {
      contact: "Contact",
      hours: "Openingstijden",
      services: "Diensten",
      servicesNo: "Niet",
      prices: "Prijzen",
      policies: "Afspraken",
      payment: "Betalen",
      notConfused: "Niet te verwarren met",
      area: "Werkgebied",
      urgency: "Spoed",
      credentials: "Erkenningen",
    },
    areaRadius: (km: number, place: string) => `Binnen ${km} km van ${place}`,
    urgencyYes: "Spoeddienst beschikbaar",
    urgencyNo: "Geen spoeddienst",
    closed: "Gesloten",
    preview: "Voorbeeld van je feitenpagina. Zo ziet AI je gegevens.",
  },

  errors: {
    generic: "Er ging iets mis. Probeer het nog een keer.",
    notFound: "Deze pagina bestaat niet.",
    loginRequired: "Log in om verder te gaan.",
  },

  email: {
    subjects: {
      report: (business: string) => `Dit zegt AI over ${business}`,
      launch: (business: string, wrong: number) => `${wrong} ${wrong === 1 ? "antwoord" : "antwoorden"} over ${business} ${wrong === 1 ? "klopt" : "kloppen"} niet`,
      followUp7: (business: string, wrong: number) => `${wrong} ${wrong === 1 ? "antwoord" : "antwoorden"} over ${business} ${wrong === 1 ? "klopt" : "kloppen"} niet`,
      followUp21: (wrongValue: string) => `Nog steeds “${wrongValue}”`,
      monthlyAllOk: (total: number) => `${total} van ${total} antwoorden kloppen`,
      monthly: (found: number, fixed: number, pending: number) => `${found} ${found === 1 ? "fout" : "fouten"} gevonden, ${fixed} hersteld, ${pending} in behandeling`,
      resolved: (business: string) => `Hersteld: ${business}`,
      welcome: "Welkom bij Maicro: vier stappen tot je eerste controle",
      login: "Je inloglink voor Maicro",
    },
  },
} as const;

export type Copy = typeof copy;
export default copy;
