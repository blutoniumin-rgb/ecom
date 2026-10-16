"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="flex items-center gap-2 overflow-x-auto lg:flex-col lg:items-stretch">
      {links.map((link) => {
        const current = isCurrent(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={
              current
                ? "shrink-0 rounded-full bg-ink px-4 py-2 text-center text-sm font-semibold text-white"
                : "shrink-0 rounded-full bg-[#f3f3f4] px-4 py-2 text-center text-sm font-semibold text-ink"
            }
          >
            {link.label}
          </Link>
        );
      })}
      <form action="/api/auth/logout" method="post" className="shrink-0 lg:mt-2">
        <button
          type="submit"
          className="w-full rounded-full px-4 py-2 text-center text-sm font-semibold text-muted hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </nav>
  );
}
