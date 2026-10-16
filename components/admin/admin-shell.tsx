"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminShellProps = {
  adminName: string;
  storeName: string;
  openOrderCount: number;
  children: ReactNode;
};

export function AdminShell({
  adminName,
  storeName,
  openOrderCount,
  children,
}: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-ink">
      <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col bg-admin-sidebar px-4 py-5">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-admin-accent text-white">
            <BagIcon />
          </span>
          <span className="text-lg font-bold tracking-tight">Wearism</span>
        </Link>

        <div className="mt-8">
          <p className="px-3 text-xs font-medium text-admin-muted">Menu</p>
          <ul className="mt-2 space-y-1">
            <NavItem
              href="/admin"
              label="Dashboard"
              active={pathname === "/admin"}
              icon={<GridIcon />}
            />
            <NavItem
              href="/admin/orders"
              label="Orders"
              active={pathname === "/admin/orders" || pathname.startsWith("/admin/orders/")}
              icon={<OrderIcon />}
              badge={openOrderCount}
            />
            <NavItem
              href="/admin/customers"
              label="Customers"
              active={pathname === "/admin/customers" || pathname.startsWith("/admin/customers/")}
              icon={<UsersIcon />}
            />
          </ul>
        </div>

        <div className="mt-8">
          <p className="px-3 text-xs font-medium text-admin-muted">Tools</p>
          <ul className="mt-2 space-y-1">
            <NavItem
              href="/admin/products"
              label="Products"
              active={pathname === "/admin/products" || pathname.startsWith("/admin/products/")}
              icon={<BoxIcon />}
            />
            <NavItem
              href="/admin"
              label="Analytics"
              active={false}
              icon={<ChartIcon />}
            />
            <NavItem
              href="/admin/reports/gst"
              label="GST invoice"
              active={pathname === "/admin/reports/gst" || pathname.startsWith("/admin/reports/gst/")}
              icon={<InvoiceIcon />}
            />
          </ul>
        </div>

        <div className="mt-auto pt-6">
          <ul>
            <NavItem
              href="/admin/settings"
              label="Settings"
              active={pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")}
              icon={<GearIcon />}
            />
          </ul>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[76px] items-center gap-4 bg-admin-bg px-6">
          <form action="/admin/products" method="get" className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-admin-muted">
              <SearchIcon />
            </span>
            <input
              type="search"
              name="q"
              placeholder="Search..."
              aria-label="Search"
              className="h-11 w-full rounded-full bg-white pr-4 pl-11 text-sm text-admin-ink ring-1 ring-black/[0.04] outline-none placeholder:text-admin-muted focus:ring-admin-accent/40"
            />
          </form>

          <span
            aria-hidden="true"
            className="hidden h-9 shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 text-xs font-medium text-admin-muted ring-1 ring-black/[0.06] sm:inline-flex"
          >
            <span className="text-sm leading-none">⌘</span>K
          </span>

          <span className="ml-auto flex items-center gap-2">
            <span
              aria-hidden="true"
              className="relative grid size-10 place-items-center rounded-full bg-white text-admin-ink ring-1 ring-black/[0.04]"
            >
              <MailIcon />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-admin-accent" />
            </span>
            <span
              aria-hidden="true"
              className="relative grid size-10 place-items-center rounded-full bg-white text-admin-ink ring-1 ring-black/[0.04]"
            >
              <BellIcon />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-admin-accent" />
            </span>
          </span>

          <div className="flex items-center gap-3 pl-1">
            <span className="grid size-10 place-items-center rounded-full bg-admin-peach text-sm font-semibold text-admin-accent">
              {initials(adminName)}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{adminName}</p>
              <p className="truncate text-xs text-admin-muted">{storeName}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 pb-8">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  active,
  icon,
  badge,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: ReactNode;
  badge?: number;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
          active
            ? "bg-admin-peach text-admin-ink"
            : "text-admin-ink/80 hover:bg-admin-peach/70"
        }`}
      >
        <span className={active ? "text-admin-accent" : "text-admin-muted"}>{icon}</span>
        <span className="truncate">{label}</span>
        {badge !== undefined ? (
          <span className="ml-auto grid min-w-6 place-items-center rounded-full bg-admin-accent px-1.5 text-[11px] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return letters || "A";
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 8.5h11l-.7 10.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 18.5c.6-2.4 2.4-3.5 4.5-3.5s3.9 1.1 4.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16.5" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.2 15c1.7.2 3 1.2 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 8 12 4.5 19.5 8 12 11.5 4.5 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4.5 8v8L12 19.5 19.5 16V8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 11.5V19.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19V10M12 19V5M19 19v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.5h8l4 4V20.5H7v-17Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15 3.5V8h4.5M9.5 12.5h6M9.5 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 4.5v1.8M12 17.7V19.5M4.5 12h1.8M17.7 12h1.8M6.7 6.7l1.3 1.3M16 16l1.3 1.3M17.3 6.7 16 8M8 16l-1.3 1.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 16.5h11l-1.1-1.6V10a4.4 4.4 0 0 0-8.8 0v4.9L6.5 16.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 18.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
