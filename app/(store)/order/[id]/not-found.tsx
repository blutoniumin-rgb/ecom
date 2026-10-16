import Link from "next/link";

export default function OrderNotFound() {
  return (
    <div className="mt-8 rounded-3xl bg-[#f6f6f7] px-6 py-16 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Order not found</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">This order is not in your account.</p>
      <Link
        href="/shop"
        className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white"
      >
        Continue shopping
      </Link>
    </div>
  );
}
