import Link from "next/link";
import { HeartIcon, SearchIcon } from "@/components/store/icons";

export function StoreHeader({
  count,
  saved,
  categories = [],
}: {
  count: number;
  saved?: boolean;
  categories?: { name: string; slug: string }[];
}) {
  const badge = count > 99 ? "99+" : String(count);

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
        <Link href="/shop?saved=1" aria-label="Wishlist" className="text-ink">
          <HeartIcon filled={Boolean(saved)} />
        </Link>
        <Link
          href="/cart"
          aria-label={`Cart, ${count} items`}
          className="grid h-8 min-w-8 place-items-center rounded-full bg-ink px-2 text-xs font-bold text-white"
        >
          {badge}
        </Link>
        <span className="text-xs font-bold tracking-wide text-ink">IN</span>
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
