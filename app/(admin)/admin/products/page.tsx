import { connection } from "next/server";
import { ProductsTable } from "@/components/admin/products-table";
import { ProductsToolbar } from "@/components/admin/products-toolbar";
import {
  firstProductImage,
  isProductFiltered,
  parseProductQuery,
  safeHttpImage,
  visibleProducts,
  type AdminProductRow,
  type ProductSort,
} from "@/components/admin/products-query";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "Products · Wearism Admin",
};

function priceWhere(band: string) {
  if (band === "under-1000") return { lt: 1000 };
  if (band === "1000-3000") return { gte: 1000, lt: 3000 };
  if (band === "3000-5000") return { gte: 3000, lte: 5000 };
  if (band === "over-5000") return { gt: 5000 };
  return undefined;
}

function orderBy(sort: ProductSort) {
  switch (sort) {
    case "name":
      return [{ name: "asc" as const }];
    case "price-asc":
      return [{ price: "asc" as const }, { name: "asc" as const }];
    case "price-desc":
      return [{ price: "desc" as const }, { name: "asc" as const }];
    case "stock-asc":
      return [{ stock: "asc" as const }, { name: "asc" as const }];
    case "stock-desc":
      return [{ stock: "desc" as const }, { name: "asc" as const }];
    default:
      return [{ createdAt: "desc" as const }, { name: "asc" as const }];
  }
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const query = parseProductQuery(await searchParams);
  const price = priceWhere(query.price);

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
    prisma.product.findMany({
      where: {
        AND: [
          query.q
            ? {
                OR: [
                  { name: { contains: query.q } },
                  { sku: { contains: query.q } },
                  { description: { contains: query.q } },
                ],
              }
            : {},
          query.category ? { category: { slug: query.category } } : {},
          query.collection ? { category: { slug: query.collection } } : {},
          price ? { price } : {},
          query.status === "active" ? { active: true } : query.status === "inactive" ? { active: false } : {},
        ],
      },
      orderBy: orderBy(query.sort),
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        active: true,
        imageUrls: true,
      },
    }),
  ]);

  const visible = visibleProducts(products, query.show);
  const rows: AdminProductRow[] = visible.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: product.price,
    stock: product.stock,
    active: product.active,
    image: safeHttpImage(firstProductImage(product.imageUrls)),
  }));
  const filtered = isProductFiltered(query);
  const summary =
    query.show === "all" || visible.length === products.length
      ? `${products.length} ${products.length === 1 ? "product" : "products"}`
      : `Showing ${visible.length} of ${products.length} products`;

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_8px_30px_rgba(28,28,28,0.04)] sm:p-5">
      <h1 className="sr-only">Products</h1>
      {query.notice === "created" ? (
        <p role="status" className="mb-4 rounded-2xl bg-[#ecfdf3] px-4 py-3 text-sm text-[#166534]">
          Product added.
        </p>
      ) : null}
      {query.notice === "saved" ? (
        <p role="status" className="mb-4 rounded-2xl bg-[#ecfdf3] px-4 py-3 text-sm text-[#166534]">
          Product updated.
        </p>
      ) : null}
      <ProductsToolbar
        key={[query.q, query.category, query.collection, query.price, query.status, query.show, query.sort, query.view].join("|")}
        categories={categories}
        query={query}
      />
      {visible.length === 0 ? (
        <p className="px-2 py-16 text-center text-sm text-admin-muted">
          {filtered ? "No products match these filters." : "No products yet."}
        </p>
      ) : (
        <div className="mt-4 border-t border-black/[0.06] pt-4">
          {query.show !== "all" ? <p className="mb-3 text-xs text-admin-muted">{summary}</p> : null}
          <ProductsTable rows={rows} view={query.view} />
        </div>
      )}
    </section>
  );
}
