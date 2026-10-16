import { Suspense } from "react";
import { CatalogFallback, CatalogPage } from "@/components/store/catalog-page";

export const metadata = {
  title: "Shop · Wearism",
};

export default function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogPage path="/shop" searchParams={searchParams} />
    </Suspense>
  );
}
