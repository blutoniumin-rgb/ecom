import type { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import {
  STYLE_WORDS,
  applyCatalogFilters,
  catalogHref,
  matchesStyle,
  parseCatalogQuery,
  productType,
  uniqueColors,
  uniqueSizes,
  type CatalogQuery,
} from "@/components/store/catalog-query";
import { ChevronIcon, LightningIcon } from "@/components/store/icons";
import { firstImage, ProductCard } from "@/components/store/product-card";
import { getWishlistIds } from "@/components/store/wishlist";

const RAIL = [
  { slug: "new-in", name: "New in" },
  { slug: "coats", name: "Coats" },
  { slug: "tops", name: "Tops" },
  { slug: "knitwear", name: "Knitwear" },
] as const;

export async function CatalogPage({
  path,
  fallbackCategory,
  searchParams,
}: {
  path: "/" | "/shop";
  fallbackCategory?: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = parseCatalogQuery(raw, fallbackCategory);
  const savedOnly = query.saved;
  const [products, categories, wishlist] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getWishlistIds(),
  ]);

  const wished = new Set(wishlist);
  const scoped = savedOnly ? products.filter((product) => wished.has(product.id)) : products;
  const categoryPool = query.category
    ? scoped.filter((product) => product.category.slug === query.category)
    : scoped;
  const results = applyCatalogFilters(scoped, query);
  const categoryName =
    categories.find((category) => category.slug === query.category)?.name ??
    (query.category ? query.category : savedOnly ? "Saved" : "All");

  const thumbs = new Map<string, string | undefined>();
  for (const category of categories) {
    const sample = products.find((product) => product.category.slug === category.slug);
    thumbs.set(category.slug, sample ? firstImage(sample.imageUrls) : undefined);
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-5 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6">
        <CategoryRail path={path} query={query} activeSlug={query.category} thumbs={thumbs} />
        <section className="min-w-0">
          <div className="flex items-end justify-between gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink uppercase sm:text-3xl">{categoryName}</h1>
          </div>
          <Link
            href={query.category ? catalogHref("/shop", query, {}, "/shop") : "/shop"}
            className="mt-1 inline-block text-xs text-muted underline"
          >
            View more
          </Link>
          <FilterBar path={path} query={query} pool={categoryPool} />
          {results.length === 0 ? (
            <p className="mt-8 text-sm text-muted">No pieces match these filters.</p>
          ) : (
            <div id="products" className="mt-5 grid min-w-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CategoryRail({
  path,
  query,
  activeSlug,
  thumbs,
}: {
  path: "/" | "/shop";
  query: CatalogQuery;
  activeSlug?: string;
  thumbs: Map<string, string | undefined>;
}) {
  return (
    <nav
      aria-label="Categories"
      className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
    >
      {RAIL.map((item) => {
        const active = activeSlug === item.slug;
        const href = catalogHref(path, query, { category: item.slug }, "/shop");
        if (item.slug === "new-in") {
          return (
            <Link
              key={item.slug}
              href={href}
              className={`flex shrink-0 items-center justify-between gap-3 rounded-2xl bg-accent px-4 py-3 text-xs font-bold tracking-[0.14em] whitespace-nowrap text-white md:shrink ${
                active ? "ring-2 ring-ink" : ""
              }`}
            >
              NEW IN
              <LightningIcon />
            </Link>
          );
        }
        const image = thumbs.get(item.slug);
        return (
          <Link
            key={item.slug}
            href={href}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-2xl bg-[#f7f7f8] px-4 py-2.5 text-xs font-bold tracking-[0.14em] whitespace-nowrap text-ink md:shrink md:py-2 ${
              active ? "ring-2 ring-ink" : ""
            }`}
          >
            {item.name.toUpperCase()}
            {image ? (
              <img src={image} alt="" className="hidden h-11 w-9 rounded-lg object-cover md:block" />
            ) : (
              <span className="hidden h-11 w-9 rounded-lg bg-neutral-200 md:block" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function FilterBar({
  path,
  query,
  pool,
}: {
  path: "/" | "/shop";
  query: CatalogQuery;
  pool: {
    name: string;
    description: string;
    sizes: string;
    colors: string;
    price: number;
  }[];
}) {
  const sizes = uniqueSizes(pool);
  const colors = uniqueColors(pool);
  const types = [...new Set(pool.map((product) => productType(product.name)))].sort((a, b) => a.localeCompare(b));
  const styles = STYLE_WORDS.filter((style) => pool.some((product) => matchesStyle(product, style)));
  const sortLabel =
    query.sort === "price-asc"
      ? "Price ↑"
      : query.sort === "price-desc"
        ? "Price ↓"
        : query.sort === "name"
          ? "Name"
          : null;

  return (
    <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
      <FilterMenu label="Sort" value={sortLabel}>
        <FilterLink href={catalogHref(path, query, { sort: "newest" })} current={query.sort === "newest"}>
          Newest
        </FilterLink>
        <FilterLink href={catalogHref(path, query, { sort: "price-asc" })} current={query.sort === "price-asc"}>
          Price: low to high
        </FilterLink>
        <FilterLink href={catalogHref(path, query, { sort: "price-desc" })} current={query.sort === "price-desc"}>
          Price: high to low
        </FilterLink>
        <FilterLink href={catalogHref(path, query, { sort: "name" })} current={query.sort === "name"}>
          Name
        </FilterLink>
      </FilterMenu>
      <FilterMenu label="Product type" value={query.type}>
        <FilterLink href={catalogHref(path, query, { type: undefined })} current={!query.type}>
          Any
        </FilterLink>
        {types.map((type) => (
          <FilterLink key={type} href={catalogHref(path, query, { type })} current={query.type === type}>
            {type}
          </FilterLink>
        ))}
      </FilterMenu>
      <FilterMenu label="Style" value={query.style}>
        <FilterLink href={catalogHref(path, query, { style: undefined })} current={!query.style}>
          Any
        </FilterLink>
        {styles.map((style) => (
          <FilterLink key={style} href={catalogHref(path, query, { style })} current={query.style === style}>
            {style}
          </FilterLink>
        ))}
      </FilterMenu>
      <FilterMenu label="Size" value={query.size}>
        <FilterLink href={catalogHref(path, query, { size: undefined })} current={!query.size}>
          Any
        </FilterLink>
        {sizes.map((size) => (
          <FilterLink key={size} href={catalogHref(path, query, { size })} current={query.size === size}>
            {size}
          </FilterLink>
        ))}
      </FilterMenu>
      <FilterMenu label="Colour" value={query.color} align="end">
        <FilterLink href={catalogHref(path, query, { color: undefined })} current={!query.color}>
          Any
        </FilterLink>
        {colors.map((color) => (
          <FilterLink key={color} href={catalogHref(path, query, { color })} current={query.color === color}>
            {color}
          </FilterLink>
        ))}
      </FilterMenu>
      <FilterMenu
        align="end"
        label="Price range"
        value={
          query.min != null || query.max != null
            ? `${query.min != null ? formatInr(query.min) : "0"}–${query.max != null ? formatInr(query.max) : "Any"}`
            : null
        }
      >
        <FilterLink href={catalogHref(path, query, { min: undefined, max: undefined })} current={query.min == null && query.max == null}>
          Any
        </FilterLink>
        <FilterLink href={catalogHref(path, query, { min: undefined, max: 999 })} current={query.max === 999 && query.min == null}>
          Under {formatInr(1000)}
        </FilterLink>
        <FilterLink href={catalogHref(path, query, { min: 1000, max: 2999 })} current={query.min === 1000 && query.max === 2999}>
          {formatInr(1000)} – {formatInr(2999)}
        </FilterLink>
        <FilterLink href={catalogHref(path, query, { min: 3000, max: 4999 })} current={query.min === 3000 && query.max === 4999}>
          {formatInr(3000)} – {formatInr(4999)}
        </FilterLink>
        <FilterLink href={catalogHref(path, query, { min: 5000, max: undefined })} current={query.min === 5000 && query.max == null}>
          {formatInr(5000)} plus
        </FilterLink>
        <PriceForm path={path} query={query} />
      </FilterMenu>
      <a
        href="#products"
        aria-label="Jump to products"
        className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-ink text-white"
      >
        <ChevronIcon />
      </a>
    </div>
  );
}

function FilterMenu({
  label,
  value,
  align = "start",
  children,
}: {
  label: string;
  value?: string | null;
  align?: "start" | "end";
  children: ReactNode;
}) {
  return (
    <details className="relative min-w-0 max-w-full max-md:open:basis-full">
      <summary className="flex max-w-full cursor-pointer list-none items-center gap-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-ink [&::-webkit-details-marker]:hidden">
        <span className="truncate">
          {label}
          {value ? <span className="text-muted"> · {value}</span> : null}
        </span>
      </summary>
      <div
        className={`z-30 mt-2 flex w-full flex-col rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg max-md:static md:absolute md:w-56 ${
          align === "end" ? "md:right-0" : "md:left-0"
        }`}
      >
        {children}
      </div>
    </details>
  );
}

function FilterLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-sm ${current ? "bg-[#f3f3f4] font-semibold text-ink" : "text-ink hover:bg-[#f7f7f8]"}`}
      aria-current={current ? "true" : undefined}
    >
      {children}
    </Link>
  );
}

function PriceForm({ path, query }: { path: "/" | "/shop"; query: CatalogQuery }) {
  return (
    <form method="get" action={path} className="mt-1 grid grid-cols-2 gap-2 border-t border-neutral-100 p-2">
      {path === "/shop" && query.category ? <input type="hidden" name="category" value={query.category} /> : null}
      {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
      {query.sort !== "newest" ? <input type="hidden" name="sort" value={query.sort} /> : null}
      {query.size ? <input type="hidden" name="size" value={query.size} /> : null}
      {query.color ? <input type="hidden" name="color" value={query.color} /> : null}
      {query.style ? <input type="hidden" name="style" value={query.style} /> : null}
      {query.type ? <input type="hidden" name="type" value={query.type} /> : null}
      {query.saved ? <input type="hidden" name="saved" value="1" /> : null}
      <input
        name="min"
        type="number"
        min={0}
        defaultValue={query.min ?? ""}
        placeholder="Min"
        aria-label="Minimum price"
        className="rounded-xl border border-neutral-200 px-2 py-1 text-sm"
      />
      <input
        name="max"
        type="number"
        min={0}
        defaultValue={query.max ?? ""}
        placeholder="Max"
        aria-label="Maximum price"
        className="rounded-xl border border-neutral-200 px-2 py-1 text-sm"
      />
      <button type="submit" className="col-span-2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">
        Apply
      </button>
    </form>
  );
}

export function CatalogFallback() {
  return (
    <div className="relative mt-5">
      <div className="flex min-h-[42vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
        <span className="wearism-spin h-10 w-10 rounded-full border-[3px] border-[#ececee] border-t-ink" />
        <p className="text-sm font-semibold text-muted">Loading the shop</p>
      </div>
    </div>
  );
}
