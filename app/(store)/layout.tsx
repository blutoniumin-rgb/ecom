import { Suspense } from "react";
import { getCartCount } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { getWishlistIds } from "@/components/store/wishlist";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <Suspense fallback={<StoreHeader count={0} />}>
          <CartHeader />
        </Suspense>
        {children}
      </div>
      <Suspense fallback={<StoreFooter categories={[]} email="hello@wearism.dev" />}>
        <StoreFooterSlot />
      </Suspense>
    </div>
  );
}

async function CartHeader() {
  const [count, wishlist, categories] = await Promise.all([
    getCartCount(),
    getWishlistIds(),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
  ]);
  return <StoreHeader count={count} saved={wishlist.length > 0} categories={categories} />;
}

async function StoreFooterSlot() {
  const [categories, setting] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
    prisma.storeSetting.findUnique({ where: { id: "singleton" }, select: { supportEmail: true } }),
  ]);
  return <StoreFooter categories={categories} email={setting?.supportEmail || "hello@wearism.dev"} />;
}
