import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { ProductGallery } from "@/components/store/gallery";
import { allImages, ProductCard } from "@/components/store/product-card";
import { ProductPurchase } from "@/components/store/product-purchase";
import { splitTokens } from "@/components/store/catalog-query";
import { HeartIcon } from "@/components/store/icons";
import { getWishlistIds, toggleWishlist } from "@/components/store/wishlist";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, active: true } });
  return { title: product?.active ? `${product.name} · Wearism` : "Wearism" };
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="mt-8 h-96 rounded-[28px] bg-[#f3f3f4]" />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product || !product.active) notFound();

  const [related, wishlist] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, categoryId: product.categoryId, NOT: { id: product.id } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    getWishlistIds(),
  ]);

  const images = allImages(product.imageUrls);
  const sizes = splitTokens(product.sizes);
  const colors = splitTokens(product.colors);
  const wished = wishlist.includes(product.id);
  const average =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

  return (
    <article className="mt-6">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
        <Link href={product.category.slug === "new-in" ? "/" : `/shop?category=${product.category.slug}`}>
          {product.category.name}
        </Link>
      </p>
      <div className="mt-4 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <ProductGallery images={images} alt={product.name} />
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 text-2xl font-extrabold tracking-tight break-words text-ink sm:text-3xl">{product.name}</h1>
            <form action={toggleWishlist}>
              <input type="hidden" name="productId" value={product.id} />
              <button
                type="submit"
                aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                aria-pressed={wished}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#f3f3f4] text-ink"
              >
                <HeartIcon filled={wished} />
              </button>
            </form>
          </div>
          <p className="mt-2 text-sm text-muted">{product.sku}</p>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-ink">{formatInr(product.price)}</span>
            {product.mrp > product.price ? (
              <span className="text-sm text-muted line-through">{formatInr(product.mrp)}</span>
            ) : null}
          </p>
          {average > 0 ? (
            <p className="mt-2 text-sm text-ink">
              <Stars rating={Math.round(average)} /> {average.toFixed(1)} · {product.reviews.length} review
              {product.reviews.length === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">No reviews yet</p>
          )}
          <p className="mt-4 max-w-prose text-sm leading-6 text-ink">{product.description}</p>
          {colors.length > 0 ? <p className="mt-3 text-sm text-muted">Colour: {colors.join(", ")}</p> : null}
          <ProductPurchase productId={product.id} sizes={sizes} stock={product.stock} />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-ink">Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Be the first to review this piece.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {product.reviews.map((review) => (
              <li key={review.id} className="rounded-2xl bg-[#f7f7f8] px-4 py-3">
                <p className="text-sm font-semibold text-ink">
                  {review.authorName} <Stars rating={review.rating} />
                </p>
                <p className="mt-1 text-sm leading-6 text-ink">{review.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-ink">More in {product.category.name}</h2>
          <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} wished={wishlist.includes(item.id)} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-ink" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("")}
    </span>
  );
}
