import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  const f = copy.landing.footer;
  return (
    <footer className="border-t border-rule">
      <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Wordmark />
          <p className="max-w-[40ch] text-[14px] text-secondary">{copy.tagline}</p>
        </div>
        <dl className="mono grid grid-cols-1 gap-x-8 gap-y-1 text-ink sm:grid-cols-2">
          <div><dd>{f.person}</dd></div>
          <div><dd>{f.kvk}</dd></div>
          <div><dd>{f.address}</dd></div>
          <div><dd>{f.vat}</dd></div>
          <div><dd>{f.exclVat}</dd></div>
          <div className="flex gap-4">
            <Link href="/privacy">{f.privacy}</Link>
            <Link href="/voorwaarden">{f.terms}</Link>
          </div>
        </dl>
      </div>
    </footer>
  );
}
