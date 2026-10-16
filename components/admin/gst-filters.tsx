"use client";

const fieldClass =
  "mt-2 h-11 rounded-full bg-[#f6f7f9] px-4 text-sm text-admin-ink outline-none ring-1 ring-black/[0.04] focus:bg-white focus:ring-2 focus:ring-admin-accent/30";

export function GstFilters({ from, to }: { from: string; to: string }) {
  return (
    <form action="/admin/reports/gst" className="flex flex-wrap items-end gap-3 print:hidden">
      <label className="text-xs font-medium text-admin-muted">
        From
        <input type="date" name="from" defaultValue={from} required className={`${fieldClass} block`} />
      </label>
      <label className="text-xs font-medium text-admin-muted">
        To
        <input type="date" name="to" defaultValue={to} required className={`${fieldClass} block`} />
      </label>
      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-full bg-admin-accent px-5 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(255,122,61,0.28)]"
      >
        Apply
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-11 items-center rounded-full border border-admin-accent/70 px-5 text-sm font-medium text-admin-accent"
      >
        Print
      </button>
    </form>
  );
}
