import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ExplainerPage } from "@/components/ExplainerPage";
import { Criteria, Drift, Vak, Werkt } from "@/components/LandingSections";

export async function generateMetadata(): Promise<Metadata> {
  const { copy, lang } = await getI18n();
  return pageMetadata({ title: copy.pages.how.title, description: copy.pages.how.description, route: "/hoe-het-werkt", lang });
}

/** How it works in full: the steps with their scenes, the twelve facts, every month, per trade. */
export default async function HowPage() {
  return (
    <ExplainerPage page="how" route="/hoe-het-werkt">
      <Werkt />
      <Criteria />
      <Drift />
      <Vak />
    </ExplainerPage>
  );
}
