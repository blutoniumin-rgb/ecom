import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quoteCart, razorpayKeys, stockProblems } from "@/app/api/checkout/quote";
import { firstImage } from "@/components/store/product-card";
import { CheckoutForm } from "@/components/store/checkout-form";

export const instant = false;

export const metadata = {
  title: "Checkout · Wearism",
};

export default async function CheckoutPage() {
  await connection();
  const session = await requireUser();
  if (!session) redirect("/login?next=/checkout");
  const [quote, addresses] = await Promise.all([
    quoteCart(),
    prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
  ]);

  const blocked =
    quote.unavailable.length > 0
      ? `${quote.unavailable.join(", ")} is no longer available. Remove it from your bag to continue.`
      : quote.lines.length === 0
        ? null
        : stockProblems(quote.lines).join(" ") || null;

  return (
    <div className="mt-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">Address, GST, and payment for this order.</p>

      {quote.lines.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-[#f6f6f7] px-6 py-16 text-center">
          <p className="text-lg font-bold text-ink">Your bag is empty</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            {quote.unavailable.length > 0
              ? `${quote.unavailable.join(", ")} is no longer available.`
              : "Add a piece from the shop before checking out."}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <CheckoutForm
          addresses={addresses}
          lines={quote.lines.map((line) => ({
            key: `${line.productId}-${line.size}`,
            name: line.name,
            size: line.size,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            gstRate: line.gstRate,
            gstAmount: line.gstAmount,
            lineTotal: line.lineTotal,
            image: firstImage(line.imageUrls) ?? null,
            slug: line.slug,
          }))}
          subtotal={quote.subtotal}
          gst={quote.gst}
          total={quote.total}
          onlineMode={razorpayKeys() ? "razorpay" : "demo"}
          blocked={blocked}
        />
      )}
    </div>
  );
}
