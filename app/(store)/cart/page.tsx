import Link from "next/link";
import { connection } from "next/server";
import { formatInr } from "@/lib/format";
import { getCartView, removeCartLine, setCartQuantity } from "@/lib/cart";
import { firstImage } from "@/components/store/product-card";
import { CartSync } from "@/components/store/cart-sync";

export const instant = false;

export const metadata = {
  title: "Bag · Wearism",
};

export default async function CartPage() {
  await connection();
  const cart = await getCartView();

  return (
    <div className="mt-8">
      <CartSync needsSync={cart.needsSync} />
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Your bag</h1>

      {cart.lines.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-[#f6f6f7] px-6 py-16 text-center">
          <p className="text-lg font-bold text-ink">Your bag is empty</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Add a piece from the shop and it will show up here.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {cart.lines.map((line) => {
              const image = firstImage(line.imageUrls);
              return (
                <li key={`${line.productId}-${line.size}`} className="flex gap-4 py-5">
                  <Link
                    href={`/product/${line.slug}`}
                    aria-label={line.name}
                    className="h-28 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f2f2f2] sm:h-32 sm:w-24"
                  >
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/product/${line.slug}`} className="font-bold text-ink">
                          {line.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted">Size {line.size}</p>
                        <p className="mt-1 text-sm text-ink">{formatInr(line.price)}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-ink">{formatInr(line.lineTotal)}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center rounded-full border border-neutral-200">
                        <form action={setCartQuantity}>
                          <input type="hidden" name="productId" value={line.productId} />
                          <input type="hidden" name="size" value={line.size} />
                          <input type="hidden" name="quantity" value={line.quantity - 1} />
                          <button
                            type="submit"
                            aria-label={`Decrease quantity of ${line.name}`}
                            disabled={line.quantity <= 1}
                            className="grid h-9 w-9 place-items-center text-lg text-ink disabled:opacity-30"
                          >
                            −
                          </button>
                        </form>
                        <span className="min-w-6 text-center text-sm font-semibold text-ink">{line.quantity}</span>
                        <form action={setCartQuantity}>
                          <input type="hidden" name="productId" value={line.productId} />
                          <input type="hidden" name="size" value={line.size} />
                          <input type="hidden" name="quantity" value={line.quantity + 1} />
                          <button
                            type="submit"
                            aria-label={`Increase quantity of ${line.name}`}
                            disabled={line.quantity >= 99}
                            className="grid h-9 w-9 place-items-center text-lg text-ink disabled:opacity-30"
                          >
                            +
                          </button>
                        </form>
                      </div>
                      <form action={removeCartLine}>
                        <input type="hidden" name="productId" value={line.productId} />
                        <input type="hidden" name="size" value={line.size} />
                        <button type="submit" className="text-sm font-semibold text-muted underline">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-3xl bg-[#f6f6f7] p-5">
            <h2 className="text-sm font-bold tracking-wide text-ink">Summary</h2>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-bold text-ink">{formatInr(cart.subtotal)}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">GST is calculated at checkout.</p>
            <Link
              href="/checkout"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
            >
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
