import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { pageMetadata, termsLd } from "@/lib/seo";
import { ExplainerPage } from "@/components/ExplainerPage";
import { AgentsSection } from "@/components/AgentsSection";

export async function generateMetadata(): Promise<Metadata> {
  const { copy, lang } = await getI18n();
  return pageMetadata({ title: copy.pages.next.title, description: copy.pages.next.description, route: "/straks", lang });
}

/** Assistants that ask each other, and the terms (OKF, llms.txt, MCP, A2A) explained. */
export default async function NextPage() {
  const { copy, lang } = await getI18n();
  return (
    <ExplainerPage page="next" route="/straks" ld={[termsLd(copy, lang)]}>
      <AgentsSection />
    </ExplainerPage>
  );
}
