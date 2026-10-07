import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScanField } from "@/components/ScanField";
import { resolveBusiness, parseQuery } from "@/lib/core";

export const dynamic = "force-dynamic";

export default async function ChoosePage({ searchParams }: { searchParams: Promise<{ q?: string; place?: string; plaats?: string }> }) {
  const { q = "", place: placeParam, plaats } = await searchParams;
  const parsed = parseQuery(q);
  const place = placeParam || parsed.place;
  const candidates = q ? await resolveBusiness(parsed.query, place) : [];
  const needsPlace = plaats === "1" || (candidates.length > 0 && candidates.every((c) => !c.place) && !place);
  const c = copy.scan.choose;
  return (
    <>
      <SiteHeader minimal />
      <main className="container max-w-[720px] py-12 sm:py-16">
        {candidates.length > 0 ? (
          <>
            <h1 className="h2">{needsPlace ? c.placeHint : c.title}</h1>
            {!needsPlace && <p className="mt-3 text-[17px]">{c.body}</p>}
            <ul className="mt-8 divide-y divide-rule border-y border-rule">
              {candidates.map((cand, i) => (
                <li key={i} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      {cand.name}
                      {cand.place ? `, ${cand.place}` : ""}
                    </p>
                    <p className="mono">{[cand.address, cand.website?.replace(/^https?:\/\/(www\.)?/, ""), cand.kvk ? `KvK ${cand.kvk}` : null].filter(Boolean).join(" · ")}</p>
                  </div>
                  <form action="/api/scan" method="post" className="flex items-end gap-2">
                    <input type="hidden" name="q" value={q} />
                    <input type="hidden" name="pick" value={i} />
                    {cand.place ? (
                      <input type="hidden" name="place" value={cand.place} />
                    ) : (
                      <div>
                        <label htmlFor={`place-${i}`} className="label">
                          {c.placeLabel}
                        </label>
                        <input id={`place-${i}`} name="place" required defaultValue={place ?? ""} className="field-sm w-[180px]" />
                      </div>
                    )}
                    <button type="submit" className="btn-small">
                      {c.button}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[14px]">
              <Link href="/">{c.back}</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="h2">{c.none}</h1>
            <div className="mt-8">
              <ScanField defaultValue={q} compact />
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
