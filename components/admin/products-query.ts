export type ProductSort =
  | "default"
  | "name"
  | "price-asc"
  | "price-desc"
  | "stock-asc"
  | "stock-desc";

export type ProductShow = "all" | "6" | "12";

export type ProductQuery = {
  q: string;
  category: string;
  collection: string;
  price: string;
  status: "" | "active" | "inactive";
  show: ProductShow;
  sort: ProductSort;
  view: "list" | "grid";
  notice: "" | "created" | "saved";
};

export type ProductFormState = { error: string } | null;

export type AdminProductRow = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  active: boolean;
  image: string | null;
};

export const PRICE_OPTIONS = [
  { value: "", label: "All prices" },
  { value: "under-1000", label: "Under ₹1,000" },
  { value: "1000-3000", label: "₹1,000 – ₹3,000" },
  { value: "3000-5000", label: "₹3,000 – ₹5,000" },
  { value: "over-5000", label: "Over ₹5,000" },
] as const;

export const STATUS_OPTIONS = [
  { value: "", label: "All status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export const SHOW_OPTIONS = [
  { value: "all", label: "All products" },
  { value: "6", label: "6 products" },
  { value: "12", label: "12 products" },
] as const;

export const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "name", label: "Name" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "stock-asc", label: "Stock: low to high" },
  { value: "stock-desc", label: "Stock: high to low" },
] as const;

const SORTS = new Set<string>(SORT_OPTIONS.map((option) => option.value));
const PRICES = new Set<string>(PRICE_OPTIONS.map((option) => option.value));

function one(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

export function parseProductQuery(
  raw: Record<string, string | string[] | undefined>,
): ProductQuery {
  const status = one(raw.status);
  const show = one(raw.show);
  const sort = one(raw.sort);
  const view = one(raw.view);
  const price = one(raw.price);
  const notice = one(raw.notice);
  return {
    q: one(raw.q),
    category: one(raw.category),
    collection: one(raw.collection),
    price: PRICES.has(price) ? price : "",
    status: status === "active" || status === "inactive" ? status : "",
    show: show === "6" || show === "12" ? show : "all",
    sort: SORTS.has(sort) ? (sort as ProductSort) : "default",
    view: view === "grid" ? "grid" : "list",
    notice: notice === "created" || notice === "saved" ? notice : "",
  };
}

export function isProductFiltered(query: ProductQuery): boolean {
  return Boolean(
    query.q ||
      query.category ||
      query.collection ||
      query.price ||
      query.status ||
      query.show !== "all" ||
      query.sort !== "default",
  );
}

export function productsHref(query: ProductQuery, patch: Partial<ProductQuery> = {}): string {
  const next: ProductQuery = { ...query, ...patch, notice: "" };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (next.collection) params.set("collection", next.collection);
  if (next.price) params.set("price", next.price);
  if (next.status) params.set("status", next.status);
  if (next.show !== "all") params.set("show", next.show);
  if (next.sort !== "default") params.set("sort", next.sort);
  if (next.view !== "list") params.set("view", next.view);
  const search = params.toString();
  return search ? `/admin/products?${search}` : "/admin/products";
}

export function visibleProducts<T>(items: T[], show: ProductShow): T[] {
  if (show === "6") return items.slice(0, 6);
  if (show === "12") return items.slice(0, 12);
  return items;
}

export function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeTokenList(raw: string): string {
  return raw
    .split(/[\n,]/)
    .map((token) => token.trim())
    .filter(Boolean)
    .join(",");
}

export function parseImageList(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      // Plain text below.
    }
  }
  return trimmed
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function imageUrlsToField(imageUrls: string): string {
  return parseImageList(imageUrls).join("\n");
}

export function serializeImageUrls(urls: string[]): string {
  return JSON.stringify(urls);
}

export function firstProductImage(imageUrls: string): string | null {
  return parseImageList(imageUrls)[0] ?? null;
}

export function safeHttpImage(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("https://") || url.startsWith("http://")) return url;
  if (/^\/uploads\/products\/[A-Za-z0-9][A-Za-z0-9._-]{0,180}$/.test(url)) return url;
  return null;
}

export function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
  fallback: string,
): string {
  return options.find((option) => option.value === value)?.label ?? (value || fallback);
}
