import Link from "next/link";
import {
  ORDER_STATUSES,
  ordersHref,
  statusLabel,
  type OrderListQuery,
} from "@/components/admin/orders-query";

const PILLS = [{ value: "" as const, label: "All" }, ...ORDER_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }))];

export function OrdersToolbar({ query }: { query: OrderListQuery }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action="/admin/orders" className="relative min-w-[220px] flex-1">
        {query.status ? <input type="hidden" name="status" value={query.status} /> : null}
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-admin-muted">
          <SearchIcon />
        </span>
        <input
          type="search"
          name="q"
          defaultValue={query.q}
          placeholder="Order id or email"
          aria-label="Search by order id or customer email"
          className="h-11 w-full rounded-full bg-[#f6f7f9] pr-4 pl-11 text-sm text-admin-ink outline-none placeholder:text-admin-muted focus:bg-white focus:ring-2 focus:ring-admin-accent/30"
        />
      </form>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {PILLS.map((pill) => {
          const selected = pill.value === query.status;
          return (
            <Link
              key={pill.label}
              href={ordersHref(query, { status: pill.value })}
              aria-current={selected ? "true" : undefined}
              className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-medium ${
                selected ? "bg-admin-accent text-white" : "bg-[#f4f5f7] text-admin-ink hover:bg-admin-peach"
              }`}
            >
              {pill.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "delivered"
      ? "bg-[#ecfdf3] text-[#166534]"
      : status === "shipped"
        ? "bg-[#eef4ff] text-[#1d4ed8]"
        : status === "processing"
          ? "bg-[#fff7e8] text-[#b45309]"
          : "bg-admin-peach text-admin-accent";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{statusLabel(status)}</span>
  );
}

export function PaymentPill({ status }: { status: string }) {
  const paid = status === "paid";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        paid ? "bg-[#ecfdf3] text-[#166534]" : "bg-admin-peach text-admin-accent"
      }`}
    >
      {paid ? "Paid" : status === "pending" ? "Pending" : status}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
