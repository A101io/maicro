import { copy } from "@maicro/core/copy";

/** The single hero field. Plain form POST so it works without JavaScript. */
export function ScanField({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  const h = copy.landing.hero;
  return (
    <form action="/api/scan" method="post" className="w-full">
      <label htmlFor="scan-q" className="label">
        {h.fieldLabel}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0">
        <input
          id="scan-q"
          name="q"
          type="text"
          required
          autoComplete="organization"
          defaultValue={defaultValue}
          placeholder={h.placeholder}
          className="field sm:rounded-r-none sm:border-r-0"
        />
        <button type="submit" className="btn-primary sm:rounded-l-none">
          {h.button}
        </button>
      </div>
      {!compact && <p className="mono mt-3">{h.mechanism}</p>}
    </form>
  );
}
