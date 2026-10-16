import Link from "next/link";
import { formatInr } from "@/lib/format";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { HeartIcon } from "@/components/store/icons";
import { splitTokens } from "@/components/store/catalog-query";
import { toggleWishlist } from "@/components/store/wishlist";

export function ProductCard({
  product,
  wished,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrls: string;
    sizes: string;
  };
  wished: boolean;
}) {
  const image = firstImage(product.imageUrls);
  const size = splitTokens(product.sizes)[0] ?? "";

  return (
    <article className="group min-w-0">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-[22px] bg-[#f2f2f2]">
          {image ? (
            <img src={image} alt={product.name} className="aspect-[3/4] w-full object-cover" />
          ) : (
            <div className="aspect-[3/4] w-full" />
          )}
        </Link>
        <form action={toggleWishlist} className="absolute bottom-3 left-3 z-10">
          <input type="hidden" name="productId" value={product.id} />
          <button
            type="submit"
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
            aria-pressed={wished}
            className={`grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm ${wished ? "text-ink" : "text-ink"}`}
          >
            <HeartIcon filled={wished} />
          </button>
        </form>
        <div className="pointer-events-none absolute inset-x-3 bottom-14 z-10 opacity-0 transition group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
          <AddToCartButton productId={product.id} size={size} compact label={size ? `Add to cart · ${size}` : "Add to cart"} />
        </div>
      </div>
      <div className="px-1 pt-2">
        <Link href={`/product/${product.slug}`} className="line-clamp-1 text-sm font-semibold text-ink">
          {product.name}
        </Link>
        <p className="text-sm text-muted">{formatInr(product.price)}</p>
      </div>
    </article>
  );
}

export function firstImage(imageUrls: string): string | undefined {
  const trimmed = imageUrls.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
    } catch {
      return undefined;
    }
  }
  return splitTokens(trimmed)[0];
}

export function allImages(imageUrls: string): string[] {
  const trimmed = imageUrls.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
    } catch {
      return [];
    }
  }
  return splitTokens(trimmed);
}
