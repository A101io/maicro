import type { Metadata } from "next";
import { copy } from "@maicro/core/copy";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: copy.legal.privacy.title,
  // Draft text stays out of search results until it has been reviewed.
  robots: copy.legal.draft ? { index: false } : undefined,
};

export default function Page() {
  return <LegalPage doc={copy.legal.privacy} />;
}
