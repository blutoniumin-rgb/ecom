"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { setProductActive } from "@/components/admin/products-actions";
import type { AdminProductRow } from "@/components/admin/products-query";
import { formatInr } from "@/lib/format";

const STOCK_SCALE = 100;

export function ProductsTable({ rows, view }: { rows: AdminProductRow[]; view: "list" | "grid" }) {
  const [selected, setSelected] = useState<string[]>([]);
  const visibleIds = rows.map((row) => row.id);
  const selectedCount = visibleIds.filter((id) => selected.includes(id)).length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleAll() {
    setSelected(allSelected ? [] : visibleIds);
  }

  return (
    <div>
      {selectedCount > 0 ? (
        <p className="mb-3 text-sm text-admin-muted">
          {selectedCount} selected
        </p>
      ) : null}
      {view === "grid" ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-3xl bg-admin-bg/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <SelectDot
                  pressed={selected.includes(row.id)}
                  label={`${selected.includes(row.id) ? "Deselect" : "Select"} ${row.name}`}
                  onClick={() => toggle(row.id)}
                />
                <ActiveForm row={row} />
              </div>
              <Link
                href={`/admin/products/${row.id}`}
                aria-label={row.name}
                className="mt-3 block overflow-hidden rounded-2xl bg-white"
              >
                {row.image ? (
                  <img src={row.image} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/3] w-full bg-[#eceff3]" />
                )}
              </Link>
              <Link href={`/admin/products/${row.id}`} className="mt-3 block truncate text-sm font-semibold">
                {row.name}
              </Link>
              <p className="truncate text-xs text-admin-muted">SKU: {row.sku}</p>
              <p className="mt-2 text-sm font-medium tabular-nums">{formatInr(row.price)}</p>
              <p className="mt-2 text-sm tabular-nums">{row.stock}</p>
              <div className="mt-2">
                <StockBar stock={row.stock} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">Products</caption>
            <thead>
              <tr className="text-xs font-medium text-admin-muted">
                <th scope="col" className="w-12 px-2 py-3">
                  <SelectDot
                    pressed={allSelected}
                    label="Select all products"
                    onClick={toggleAll}
                  />
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Product info
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Price
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  In stock
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  <span className="sr-only">Stock level</span>
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium">
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-black/[0.06]">
                  <td className="px-2 py-3">
                    <SelectDot
                      pressed={selected.includes(row.id)}
                      label={`${selected.includes(row.id) ? "Deselect" : "Select"} ${row.name}`}
                      onClick={() => toggle(row.id)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {row.image ? (
                        <img src={row.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="size-12 shrink-0 rounded-xl bg-admin-bg" />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${row.id}`}
                          className="block max-w-[280px] truncate font-medium hover:text-admin-accent"
                        >
                          {row.name}
                        </Link>
                        <p className="truncate text-xs text-admin-muted">SKU: {row.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium tabular-nums">{formatInr(row.price)}</td>
                  <td className="px-3 py-3 tabular-nums">{row.stock}</td>
                  <td className="px-3 py-3">
                    <StockBar stock={row.stock} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end">
                      <ActiveForm row={row} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActiveForm({ row }: { row: AdminProductRow }) {
  return (
    <form action={setProductActive}>
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="active" value={row.active ? "false" : "true"} />
      <ActiveSwitch on={row.active} name={row.name} />
    </form>
  );
}

function ActiveSwitch({ on, name }: { on: boolean; name: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      role="switch"
      aria-checked={on}
      aria-label={`${on ? "Deactivate" : "Activate"} ${name}`}
      disabled={pending}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60 ${
        on ? "bg-[#22c55e]" : "bg-[#d7dbe2]"
      }`}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function StockBar({ stock }: { stock: number }) {
  const ratio = Math.min(1, Math.max(0, stock) / STOCK_SCALE);
  const low = ratio < 0.5;
  return (
    <div
      className="flex min-w-36 items-center gap-2"
      role="img"
      aria-label={`${stock} of ${STOCK_SCALE}, ${low ? "low" : "healthy"} stock`}
    >
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#eceff3]">
        <div
          className={`h-full rounded-full ${low ? "bg-admin-accent" : "bg-[#22c55e]"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className={`w-12 text-xs font-medium tabular-nums ${low ? "text-admin-accent" : "text-[#16a34a]"}`}>
        {stock}/{STOCK_SCALE}
      </span>
    </div>
  );
}

function SelectDot({
  pressed,
  label,
  onClick,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={`grid size-5 place-items-center rounded-full ${
        pressed ? "bg-[#22c55e] text-white" : "border border-black/15 bg-white"
      }`}
    >
      {pressed ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 6.2 4.7 8.4 9.5 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : null}
    </button>
  );
}
