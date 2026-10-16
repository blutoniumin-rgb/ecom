export type SortKey = "newest" | "price-asc" | "price-desc" | "name";

export type CatalogQuery = {
  category?: string;
  q?: string;
  sort: SortKey;
  size?: string;
  color?: string;
  style?: string;
  type?: string;
  min?: number;
  max?: number;
  saved: boolean;
};

const SORTS = new Set<SortKey>(["newest", "price-asc", "price-desc", "name"]);

export const STYLE_WORDS = [
  "Cropped",
  "Oversized",
  "Tailored",
  "Ribbed",
  "Boxy",
  "Chunky",
  "Satin",
  "Wool",
  "Leather",
  "Merino",
] as const;

const SIZE_ORDER = ["XS", "S", "M", "L", "XL"];

export function firstParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function parseMoney(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return undefined;
  return Math.floor(amount);
}

export function parseCatalogQuery(
  raw: Record<string, string | string[] | undefined>,
  fallbackCategory?: string,
): CatalogQuery {
  const sortRaw = firstParam(raw.sort);
  const sort = sortRaw && SORTS.has(sortRaw as SortKey) ? (sortRaw as SortKey) : "newest";
  return {
    category: firstParam(raw.category) ?? fallbackCategory,
    q: firstParam(raw.q),
    sort,
    size: firstParam(raw.size),
    color: firstParam(raw.color),
    style: firstParam(raw.style),
    type: firstParam(raw.type),
    min: parseMoney(firstParam(raw.min)),
    max: parseMoney(firstParam(raw.max)),
    saved: firstParam(raw.saved) === "1",
  };
}

export function productType(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}

export function splitTokens(value: string): string[] {
  return value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

export function hasToken(value: string, token: string): boolean {
  return splitTokens(value).some((item) => item.toLowerCase() === token.toLowerCase());
}

type Filterable = {
  name: string;
  description: string;
  sku: string;
  price: number;
  sizes: string;
  colors: string;
  createdAt: Date;
  category: { name: string; slug: string };
};

export function matchesStyle(product: { name: string; description: string }, style: string): boolean {
  const haystack = `${product.name} ${product.description}`.toLowerCase();
  return haystack.includes(style.toLowerCase());
}

export function applyCatalogFilters<T extends Filterable>(products: T[], query: CatalogQuery): T[] {
  const q = query.q?.toLowerCase();
  const filtered = products.filter((product) => {
    if (query.category && product.category.slug !== query.category) return false;
    if (q) {
      const haystack = `${product.name} ${product.description} ${product.sku} ${product.colors} ${product.category.name}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (query.size && !hasToken(product.sizes, query.size)) return false;
    if (query.color && !hasToken(product.colors, query.color)) return false;
    if (query.style && !matchesStyle(product, query.style)) return false;
    if (query.type && productType(product.name).toLowerCase() !== query.type.toLowerCase()) return false;
    if (query.min != null && product.price < query.min) return false;
    if (query.max != null && product.price > query.max) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (query.sort === "price-asc") return a.price - b.price || a.name.localeCompare(b.name);
    if (query.sort === "price-desc") return b.price - a.price || a.name.localeCompare(b.name);
    if (query.sort === "name") return a.name.localeCompare(b.name);
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return filtered;
}

export function uniqueSizes(products: { sizes: string }[]): string[] {
  const found = new Set<string>();
  for (const product of products) {
    for (const size of splitTokens(product.sizes)) found.add(size);
  }
  return [...found].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
  });
}

export function uniqueColors(products: { colors: string }[]): string[] {
  const found = new Set<string>();
  for (const product of products) {
    for (const color of splitTokens(product.colors)) found.add(color);
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

export function catalogHref(
  path: "/" | "/shop",
  query: CatalogQuery,
  patch: Partial<CatalogQuery> & { category?: string | undefined },
  target: "/" | "/shop" = path,
): string {
  const next: CatalogQuery = { ...query, ...patch };
  const params = new URLSearchParams();
  if (target === "/shop" && next.category) params.set("category", next.category);
  if (next.q) params.set("q", next.q);
  if (next.sort !== "newest") params.set("sort", next.sort);
  if (next.size) params.set("size", next.size);
  if (next.color) params.set("color", next.color);
  if (next.style) params.set("style", next.style);
  if (next.type) params.set("type", next.type);
  if (next.min != null) params.set("min", String(next.min));
  if (next.max != null) params.set("max", String(next.max));
  if (next.saved) params.set("saved", "1");
  const search = params.toString();
  return search ? `${target}?${search}` : target;
}
