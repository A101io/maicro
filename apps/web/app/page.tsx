import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { JsonLd, faqLd, organizationLd, pageMetadata, serviceLd, websiteLd } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Faq } from "@/components/Faq";
import { Bewijs, CheckBand, Hero, MoreLinks, Prijs, Probeer, Rapport, Slot, VakLine, Veranderd, Werkt } from "@/components/LandingSections";

export async function generateMetadata(): Promise<Metadata> {
  const { copy, lang } = await getI18n();
  return pageMetadata({ ...copy.pages.home, route: "/", lang, absoluteTitle: true });
}

/**
 * The landing page has one job: from "what does AI say about me?" to a free
 * check, and from the report to a plan. So: the promise, proof you can try,
 * what it costs you, how it works, an example report, the price, questions,
 * and a check field wherever the question comes up. The longer explanation
 * lives on /waarom, /hoe-het-werkt and /straks (docs/landing-audit.md).
 */
export default async function LandingPage() {
  const { copy, lang } = await getI18n();
  return (
    <>
      <JsonLd data={[organizationLd(copy), websiteLd(copy, lang), serviceLd(copy, lang), faqLd(copy.landing.vragen.items)]} />
      <span id="top" />
      <SiteHeader />
      <main>
        <Hero />
        <Probeer />
        <CheckBand id="na-probeer" tone="sky" />
        <Veranderd panels={false} />
        <Werkt scenes={false} more={<MoreLinks />} />
        <Rapport />
        <Bewijs />
        <CheckBand id="na-bewijs" />
        <Prijs />
        <Faq />
        <VakLine />
        <Slot />
      </main>
      <SiteFooter />
    </>
  );
}
