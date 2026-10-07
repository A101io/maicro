"use client";

import { useState } from "react";
import { copy } from "@maicro/core/copy";

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const s = copy.result.share;
  return (
    <div>
      <h3 className="text-[16px] font-semibold">{s.label}</h3>
      <p className="mono mt-1">{s.note}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input readOnly value={url} className="field-sm font-mono text-[13px]" onFocus={(e) => e.currentTarget.select()} aria-label={s.label} />
        <button
          type="button"
          className="btn-small shrink-0"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              /* clipboard unavailable: the field is selectable */
            }
          }}
        >
          {copied ? s.copied : s.copy}
        </button>
      </div>
    </div>
  );
}
