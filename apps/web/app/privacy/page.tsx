import type { Metadata } from "next";
import { getCopy, getI18n } from "@/lib/i18n";
import { LegalPage } from "@/components/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getCopy();
  return {
    title: copy.legal.privacy.title,
    // Draft text stays out of search results until it has been reviewed.
    robots: copy.legal.draft ? { index: false } : undefined,
  };
}

export default async function Page() {
  const { copy } = await getI18n();
  return <LegalPage doc={copy.legal.privacy} />;
}
