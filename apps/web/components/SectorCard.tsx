import Link from "next/link";
import type { SectorSlug } from "@maicro/core/types";
import { copy } from "@maicro/core/copy";

/** One sector card on the landing: name, decisive facts, example question; links to /vak/[slug]. */
export function SectorCard({ slug }: { slug: SectorSlug }) {
  const c = copy.landing.vak.cards[slug];
  return (
    <Link href={`/vak/${slug}`} className="card-sm flex flex-col gap-1.5 p-[18px] text-ink hover:border-ink hover:text-ink">
      <span className="text-[16px] font-extrabold">{c.title}</span>
      <span className="text-[13px] text-muted">{c.facts}</span>
      <span className="mt-1.5 text-[14px] italic text-ink-2">{c.example}</span>
    </Link>
  );
}
