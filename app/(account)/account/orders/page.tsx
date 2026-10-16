import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { formatInr } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { formatOrderDate, paymentLabel, statusLabel } from "@/components/account/labels";

export const instant = false;

export const metadata = {
  title: "Orders · Wearism",
};

export default async function OrdersPage() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      status: true,
      total: true,
      paymentMethod: true,
    },
  });

  return (
    <section>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Orders</h1>
      <p className="mt-2 text-sm text-muted">Every order placed with this account.</p>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-[#f6f6f7] px-6 py-12 text-center">
          <p className="font-bold text-ink">No orders yet</p>
          <Link href="/shop" className="mt-4 inline-flex text-sm font-bold text-ink underline">
            Browse the shop
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="grid gap-2 px-5 py-4 hover:bg-[#fafafa] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{order.id}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatOrderDate(order.createdAt)} · {statusLabel(order.status)} · {paymentLabel(order.paymentMethod)}
                  </p>
                </div>
                <p className="text-sm font-bold text-ink">{formatInr(order.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
