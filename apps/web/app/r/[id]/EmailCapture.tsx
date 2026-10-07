import { copy } from "@maicro/core/copy";

export function EmailCapture({ scanRunId, businessId, sent, invalid }: { scanRunId: string; businessId: string; sent: boolean; invalid: boolean }) {
  const e = copy.result.email;
  return (
    <div>
      <h3 className="text-[16px] font-semibold">{e.h3}</h3>
      {sent ? (
        <p className="mt-2 text-[15px]">{e.sent}</p>
      ) : (
        <form action="/api/report-email" method="post" className="mt-3">
          <input type="hidden" name="scan" value={scanRunId} />
          <input type="hidden" name="business" value={businessId} />
          <label htmlFor="report-email" className="sr-only">
            {e.label}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id="report-email" name="email" type="email" required placeholder={e.placeholder} className="field-sm" />
            <button type="submit" className="btn-small shrink-0">
              {e.button}
            </button>
          </div>
          {invalid && <p className="mt-2 text-[14px] text-wrong">{e.invalid}</p>}
        </form>
      )}
    </div>
  );
}
