import Link from "next/link";
import { SearchIcon } from "@/components/store/icons";
import { getSession } from "@/lib/auth";

export async function StoreHeader({
  count,
  categories = [],
}: {
  count: number;
  categories?: { name: string; slug: string }[];
}) {
  const session = await getSession();
  return <StoreHeaderView count={count} categories={categories} signedIn={session !== null} />;
}

export function StoreHeaderFallback({
  count,
  categories = [],
}: {
  count: number;
  categories?: { name: string; slug: string }[];
}) {
  return <StoreHeaderView count={count} categories={categories} signedIn={false} />;
}

function StoreHeaderView({
  count,
  categories = [],
  signedIn,
}: {
  count: number;
  categories?: { name: string; slug: string }[];
  signedIn: boolean;
}) {
  const badge = count > 99 ? "99+" : String(count);
  const accountHref = signedIn ? "/account" : "/login?next=/account";

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-3">
      <Link href="/" className="shrink-0 text-2xl font-extrabold tracking-tight text-ink sm:text-[1.7rem]">
        wearism
      </Link>
      <form method="get" action="/shop" className="relative order-last w-full min-w-0 md:order-none md:w-auto md:flex-1">
        <label className="sr-only" htmlFor="store-search">
          Search for items, brands and inspiration
        </label>
        <input
          id="store-search"
          name="q"
          placeholder="Search for items, brands and inspiration"
          className="h-11 w-full rounded-full bg-[#f3f3f4] px-4 pr-11 text-sm text-ink outline-none placeholder:text-neutral-400"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500"
        >
          <SearchIcon />
        </button>
      </form>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        <Link
          href={accountHref}
          aria-label="Account"
          className="grid h-9 w-9 place-items-center text-ink"
        >
          <AccountIcon />
        </Link>
        <Link
          href="/cart"
          aria-label={`Cart, ${count} items`}
          className="relative grid h-9 w-9 place-items-center text-ink"
        >
          <BagIcon />
          {count > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold leading-none text-white">
              {badge}
            </span>
          ) : null}
        </Link>
      </div>
      <nav aria-label="Store" className="-mx-1 flex w-full gap-1 overflow-x-auto pb-1">
        <Link href="/" className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#f3f3f4]">
          Home
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${category.slug}`}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-ink hover:bg-[#f3f3f4]"
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function AccountIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19.25v-.35a4.55 4.55 0 0 1 4.55-4.55h3.9a4.55 4.55 0 0 1 4.55 4.55v.35"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.4 8h11.2l-.85 12.1a1 1 0 0 1-1 .9H8.25a1 1 0 0 1-1-.9L6.4 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6.6a3 3 0 0 1 6 0V8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
