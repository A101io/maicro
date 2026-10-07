"use client";

import { useState } from "react";
import type { Facts, Hours, PriceItem } from "@maicro/core/types";
import { copy } from "@maicro/core/copy";
import { saveFacts } from "./actions";

const F = copy.facts;

/** Chip input: a list of short strings; Enter or comma adds, × removes. */
function ChipInput({ name, label, hint, initial }: { name: string; label: string; hint?: string; initial: string[] }) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().replace(/,$/, "");
    if (v && !items.includes(v)) setItems([...items, v]);
    setDraft("");
  };
  return (
    <div>
      <label htmlFor={`chip-${name}`} className="label">
        {label}
      </label>
      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-btn border border-rule bg-white p-2 focus-within:border-ink">
        {items.map((it) => (
          <span key={it} className="chip-neutral font-sans text-[14px]">
            {it}
            <input type="hidden" name={name} value={it} />
            <button type="button" aria-label={`${F.fields.remove}: ${it}`} onClick={() => setItems(items.filter((x) => x !== it))} className="ml-1 text-secondary hover:text-ink">
              ×
            </button>
          </span>
        ))}
        <input
          id={`chip-${name}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && !draft && items.length) setItems(items.slice(0, -1));
          }}
          onBlur={add}
          placeholder={hint ?? F.fields.addItem}
          className="min-w-[160px] flex-1 bg-transparent px-1 text-[15px] outline-none placeholder:text-secondary/70"
        />
      </div>
    </div>
  );
}

function HoursRows({ initial }: { initial: Hours[] }) {
  const [rows, setRows] = useState<Hours[]>(
    [0, 1, 2, 3, 4, 5, 6].map((d) => initial.find((h) => h.day === d) ?? { day: d as Hours["day"], open: "09:00", close: "17:00", closed: d === 6 }),
  );
  const update = (i: number, patch: Partial<Hours>) => setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <table className="w-full text-[15px]">
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.day} className="border-t border-rule">
            <th scope="row" className="w-[90px] py-2 pr-3 text-left align-top font-medium sm:w-[110px]">
              {F.days[r.day]}
            </th>
            <td className="py-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-[14px]">
                  <input type="checkbox" name={`hours.${r.day}.closed`} checked={r.closed} onChange={(e) => update(i, { closed: e.target.checked })} />
                  {F.fields.closed}
                </label>
                {!r.closed && (
                  <>
                    <input type="time" name={`hours.${r.day}.open`} value={r.open ?? ""} onChange={(e) => update(i, { open: e.target.value })} className="field-sm w-[112px] px-2 font-mono text-[13px]" aria-label={`${F.days[r.day]} ${F.fields.open}`} />
                    <span className="text-secondary">–</span>
                    <input type="time" name={`hours.${r.day}.close`} value={r.close ?? ""} onChange={(e) => update(i, { close: e.target.value })} className="field-sm w-[112px] px-2 font-mono text-[13px]" aria-label={`${F.days[r.day]} ${F.fields.close}`} />
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PriceRows({ initial }: { initial: PriceItem[] }) {
  const [rows, setRows] = useState<PriceItem[]>(initial);
  return (
    <div className="space-y-2">
      {rows.map((p, i) => (
        <div key={i} className="grid grid-cols-[1fr_110px_120px_auto] items-center gap-2">
          <input name={`price.${i}.label`} defaultValue={p.label} placeholder={F.fields.priceLabel} className="field-sm" aria-label={F.fields.priceLabel} />
          <input name={`price.${i}.amount`} type="number" step="0.01" min="0" defaultValue={p.amount} placeholder="0,00" className="field-sm font-mono" aria-label={F.fields.priceAmount} />
          <input name={`price.${i}.unit`} defaultValue={p.unit ?? ""} placeholder={F.fields.priceUnit} className="field-sm" aria-label={F.fields.priceUnit} />
          <button type="button" className="text-[14px] text-secondary hover:text-ink" onClick={() => setRows(rows.filter((_, idx) => idx !== i))} aria-label={F.fields.remove}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="text-[14px]" onClick={() => setRows([...rows, { label: "", amount: 0 }])}>
        + {F.fields.addItem}
      </button>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card p-5">
      <legend className="sr-only">{title}</legend>
      <h2 className="mb-4 font-sans text-[18px] font-semibold tracking-normal">{title}</h2>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

export function FactsForm({ facts }: { facts: Facts }) {
  const f = F.fields;
  return (
    <form action={saveFacts} className="space-y-4">
      <Group title={F.groups.basics}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">{f.name}</label>
            <input id="name" name="name" required defaultValue={facts.name} className="field-sm" />
          </div>
          <div>
            <label htmlFor="place" className="label">{f.place}</label>
            <input id="place" name="place" required defaultValue={facts.place} className="field-sm" />
          </div>
          <div>
            <label htmlFor="address" className="label">{f.address}</label>
            <input id="address" name="address" defaultValue={facts.address ?? ""} className="field-sm" />
          </div>
          <div>
            <label htmlFor="postcode" className="label">{f.postcode}</label>
            <input id="postcode" name="postcode" defaultValue={facts.postcode ?? ""} className="field-sm font-mono" />
          </div>
          <div>
            <label htmlFor="openStatus" className="label">{f.openStatus}</label>
            <select id="openStatus" name="openStatus" defaultValue={facts.openStatus} className="field-sm">
              {Object.entries(f.openStatusOptions).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </Group>

      <Group title={F.groups.contact}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="phone" className="label">{f.phone}</label>
            <input id="phone" name="phone" type="tel" defaultValue={facts.phone ?? ""} className="field-sm font-mono" />
          </div>
          <div>
            <label htmlFor="email" className="label">{f.email}</label>
            <input id="email" name="email" type="email" defaultValue={facts.email ?? ""} className="field-sm" />
          </div>
          <div>
            <label htmlFor="website" className="label">{f.website}</label>
            <input id="website" name="website" type="url" defaultValue={facts.website ?? ""} className="field-sm font-mono" />
          </div>
        </div>
      </Group>

      <Group title={F.groups.hours}>
        <HoursRows initial={facts.hours} />
      </Group>

      <Group title={F.groups.services}>
        <ChipInput name="servicesYes" label={f.servicesYes} initial={facts.servicesYes} />
        <ChipInput name="servicesNo" label={f.servicesNo} initial={facts.servicesNo} />
      </Group>

      <Group title={F.groups.prices}>
        <PriceRows initial={facts.prices} />
      </Group>

      <Group title={F.groups.policies}>
        <ChipInput name="policies" label={f.policies} hint={f.policiesHint} initial={facts.policies} />
      </Group>

      <Group title={F.groups.payment}>
        <ChipInput name="paymentMethods" label={f.paymentMethods} initial={facts.paymentMethods} />
      </Group>

      <Group title={F.groups.confusion}>
        <ChipInput name="notConfusedWith" label={f.notConfusedWith} hint={f.notConfusedWithHint} initial={facts.notConfusedWith} />
      </Group>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          {F.submit}
        </button>
      </div>
    </form>
  );
}
