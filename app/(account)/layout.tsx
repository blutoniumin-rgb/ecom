import { Suspense } from "react";
import { getCartCount } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { AccountNav } from "@/components/account/account-nav";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <Suspense fallback={<StoreHeader count={0} />}>
          <CartHeader />
        </Suspense>
        <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
          <AccountNav />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <Suspense fallback={<StoreFooter categories={[]} email="hello@wearism.dev" />}>
        <StoreFooterSlot />
      </Suspense>
    </div>
  );
}

async function CartHeader() {
  const [count, categories] = await Promise.all([
    getCartCount(),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
  ]);
  return <StoreHeader count={count} categories={categories} />;
}

async function StoreFooterSlot() {
  const [categories, setting] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
    prisma.storeSetting.findUnique({ where: { id: "singleton" }, select: { supportEmail: true } }),
  ]);
  return <StoreFooter categories={categories} email={setting?.supportEmail || "hello@wearism.dev"} />;
}
