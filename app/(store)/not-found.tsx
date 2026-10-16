import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="px-2 py-16 text-center">
      <h1 className="text-3xl font-extrabold text-ink">Piece not found</h1>
      <p className="mt-2 text-sm text-muted">That product is not in the Wearism catalog.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white">
        Back home
      </Link>
    </div>
  );
}
