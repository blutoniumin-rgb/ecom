import Link from "next/link";
import { formatInr } from "@/lib/format";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { splitTokens } from "@/components/store/catalog-query";

export function ProductCard({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrls: string;
    sizes: string;
  };
}) {
  const image = firstImage(product.imageUrls);
  const size = splitTokens(product.sizes)[0] ?? "";

  return (
    <article className="group flex min-w-0 flex-col">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-[22px] bg-[#f2f2f2] transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_4px_8px_-2px_rgba(17,17,17,0.08),0_16px_32px_-8px_rgba(17,17,17,0.18),0_28px_48px_-16px_rgba(255,122,61,0.28)] motion-reduce:transition-none">
        {image ? (
          <img src={image} alt={product.name} className="aspect-[3/4] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none" />
        ) : (
          <div className="aspect-[3/4] w-full" />
        )}
      </Link>
      <div className="flex min-w-0 flex-col pt-2">
        <Link href={`/product/${product.slug}`} className="line-clamp-1 text-sm font-semibold text-ink">
          {product.name}
        </Link>
        <p className="text-sm text-muted">{formatInr(product.price)}</p>
        <div className="mt-2 min-w-0">
          <AddToCartButton
            productId={product.id}
            size={size}
            compact
            label={size ? `Add to cart · ${size}` : "Add to cart"}
          />
        </div>
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
