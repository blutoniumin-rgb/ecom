import { Suspense } from "react";
import Link from "next/link";
import { RouteProgress } from "@/components/store/route-progress";
import { SectionSpinner } from "@/components/store/section-spinner";
import { AuthSignOut } from "./auth-sign-out";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-ink sm:px-8 sm:py-10">
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col sm:min-h-[calc(100vh-5rem)]">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-ink">
            wearism
          </Link>
          <Suspense fallback={null}>
            <AuthSignOut />
          </Suspense>
        </header>
        <div className="mt-10 w-full max-w-md pb-8">
          <Suspense fallback={<SectionSpinner label="Loading" />}>{children}</Suspense>
        </div>
      </section>
    </main>
  );
}
