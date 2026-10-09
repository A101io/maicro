import { copy } from "@maicro/core/copy";

/** "Stuur dit rapport naar mij": one field with a black Verstuur button. Plain POST. */
export function EmailCapture({ scanRunId, businessId, sent, invalid }: { scanRunId: string; businessId: string; sent: boolean; invalid: boolean }) {
  const e = copy.result.email;
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-[16px] font-bold">{e.h3}</h3>
      {sent ? (
        <p className="text-[15px] text-ink-2">{e.sent}</p>
      ) : (
        <form action="/api/report-email" method="post">
          <input type="hidden" name="scan" value={scanRunId} />
          <input type="hidden" name="business" value={businessId} />
          <label htmlFor="report-email" className="sr-only">
            {e.label}
          </label>
          <div className="flex overflow-hidden rounded-btn border-[1.5px] border-ink bg-white">
            <input id="report-email" name="email" type="email" required placeholder={e.placeholder} className="h-[52px] min-w-0 flex-1 border-0 bg-white px-4 text-[15px] placeholder:text-muted focus:outline-none" />
            <button type="submit" className="h-[52px] shrink-0 bg-ink px-5 text-[14px] font-extrabold text-white hover:bg-[#1f2937]">
              {e.button}
            </button>
          </div>
          {invalid && <p className="mt-2 text-[14px] text-rood">{e.invalid}</p>}
        </form>
      )}
    </div>
  );
}
