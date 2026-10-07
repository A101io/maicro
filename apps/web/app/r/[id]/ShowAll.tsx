"use client";

import { Children, useState, type ReactNode } from "react";

/** Shows the first `initial` children; a button reveals the rest. */
export function ShowAll({ children, initial, total, label }: { children: ReactNode; initial: number; total: number; label: string }) {
  const [all, setAll] = useState(total <= initial);
  const items = Children.toArray(children);
  const visible = all ? items : items.slice(0, initial);
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{visible}</div>
      {!all && (
        <div className="mt-6">
          <button type="button" className="btn-small" onClick={() => setAll(true)}>
            {label}
          </button>
        </div>
      )}
    </div>
  );
}
