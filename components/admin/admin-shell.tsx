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
            <li>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-admin-ink/80 transition-colors hover:bg-admin-peach/70 hover:text-admin-accent"
                >
                  <span className="text-admin-muted">
                    <LogoutIcon />
                  </span>
                  <span className="truncate">Log out</span>
                </button>
              </form>
            </li>
          </ul>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-end gap-4 bg-admin-bg px-6">
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


function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 8l4 4-4 4M19 12H9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
