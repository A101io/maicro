import type { Metadata } from "next";
import { getCopy, getI18n } from "@/lib/i18n";
import { LegalPage } from "@/components/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getCopy();
  return { title: copy.legal.cookies.title, description: copy.legal.cookies.intro };
}

/** The cookie statement: an inventory of everything the site stores on a device (LEGAL-NL §6). Not a draft: it describes the code. */
export default async function Page() {
  const { copy } = await getI18n();
  return <LegalPage doc={copy.legal.cookies} draft={false} />;
}
