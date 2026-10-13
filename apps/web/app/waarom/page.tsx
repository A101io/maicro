import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ExplainerPage } from "@/components/ExplainerPage";
import { Leest, Loket, Missie, Snippers, Veranderd } from "@/components/LandingSections";

export async function generateMetadata(): Promise<Metadata> {
  const { copy, lang } = await getI18n();
  return pageMetadata({ title: copy.pages.why.title, description: copy.pages.why.description, route: "/waarom", lang });
}

/** Why AI answers about a business go wrong: the long version, moved off the landing. */
export default async function WhyPage() {
  return (
    <ExplainerPage page="why" route="/waarom">
      <Veranderd />
      <Leest />
      <Snippers />
      <Loket />
      <Missie />
    </ExplainerPage>
  );
}
