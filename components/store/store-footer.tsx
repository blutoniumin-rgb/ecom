import Link from "next/link";

export function StoreFooter({
  categories,
  email,
}: {
  categories: { name: string; slug: string }[];
  email: string;
}) {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-[#fafafa] text-ink">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 py-10 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <h2 className="text-sm font-bold tracking-wide">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/shop?category=${category.slug}`} className="hover:text-ink">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wide">Help</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/account" className="hover:text-ink">
                Orders
              </Link>
            </li>
            <li>Contact</li>
            <li>Shipping</li>
            <li>Returns</li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wide">Company</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>About Wearism</li>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wide">Contact</h2>
          <p className="mt-3 text-sm text-muted">Wearism Studio, Bengaluru, Karnataka</p>
          <a href={`mailto:${email}`} className="mt-2 inline-block text-sm text-ink underline">
            {email}
          </a>
          <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">Newsletter coming soon</p>
          <input
            type="email"
            disabled
            placeholder="Email address"
            aria-label="Email address, newsletter coming soon"
            className="mt-2 h-10 w-full rounded-full border border-neutral-200 bg-white px-4 text-sm text-muted"
          />
        </div>
      </div>
      <div className="border-t border-neutral-200">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-1 px-4 py-4 text-xs text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© Wearism</p>
          <p>Prices shown in INR</p>
          <p>COD available, easy returns, GST invoice</p>
        </div>
      </div>
    </footer>
  );
}
