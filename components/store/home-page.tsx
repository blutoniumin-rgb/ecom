import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { HeroSlider } from "@/components/store/hero-slider";

const BLURBS: Record<string, string> = {
  "new-in": "Just in — the pieces we added this week.",
  coats: "Jackets and coats for cooler city days.",
  tops: "Shirts, camisoles, and everyday layers.",
  knitwear: "Cardigans and knits in easy yarns.",
};

export async function HomePage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mt-2">
      <HeroSlider />

      <div className="mt-10 space-y-12">
        {categories.map((category) => {
          const items = products.filter((product) => product.categoryId === category.id).slice(0, 4);
          const blurb = BLURBS[category.slug] ?? `The current ${category.name.toLowerCase()} edit.`;
          return (
            <section key={category.id} aria-labelledby={`home-${category.slug}`}>
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 id={`home-${category.slug}`} className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                    {category.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{blurb}</p>
                </div>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="shrink-0 text-sm font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4"
                >
                  View all
                </Link>
              </div>
              {items.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Nothing in this edit yet.</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
