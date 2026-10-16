import { connection } from "next/server";
import { RevenueChart, type RevenueDayPoint } from "@/components/admin/revenue-chart";
import { formatInr } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const instant = false;

const ORDER_STATUSES = ["placed", "processing", "shipped", "delivered"] as const;

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayLabel = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
});

export default async function AdminDashboardPage() {
  await connection();
  const [paid, statusGroups, lowStock, orders] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "paid" },
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, sku: true, stock: true },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    }),
    prisma.order.findMany({
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const counts = new Map<string, number>(ORDER_STATUSES.map((status) => [status, 0]));
  for (const row of statusGroups) {
    if (counts.has(row.status)) {
      counts.set(row.status, row._count._all);
    }
  }

  const byDay = new Map<string, RevenueDayPoint>();
  for (const order of orders) {
    const key = dayKey.format(order.createdAt);
    const existing = byDay.get(key);
    if (existing) {
      existing.total += order.total;
    } else {
      byDay.set(key, { label: dayLabel.format(order.createdAt), total: order.total });
    }
  }

  const revenue = paid._sum.total ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-admin-muted">Paid revenue, order status, and stock at or under 5.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
          <p className="text-sm font-medium text-admin-muted">Revenue</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{formatInr(revenue)}</p>
          <p className="mt-2 text-xs text-admin-muted">Sum of order totals with payment status paid.</p>
        </article>

        <article className="rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)] lg:col-span-3">
          <h2 className="text-sm font-medium text-admin-muted">Orders</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ORDER_STATUSES.map((status) => (
              <div key={status} className="rounded-2xl bg-admin-bg px-4 py-3">
                <dt className="text-xs font-medium tracking-wide text-admin-muted uppercase">{status}</dt>
                <dd className="mt-1 text-2xl font-semibold">{counts.get(status) ?? 0}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
          <h2 className="text-base font-semibold">Low stock</h2>
          <p className="mt-1 text-xs text-admin-muted">Products with stock at or under 5.</p>
          {lowStock.length === 0 ? (
            <p className="mt-6 text-sm text-admin-muted">No products are at or under 5 in stock.</p>
          ) : (
            <ul className="mt-4 divide-y divide-black/[0.06]">
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-admin-muted">{product.sku}</p>
                  </div>
                  <p className="text-sm font-semibold text-admin-accent">{product.stock}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
          <h2 className="text-base font-semibold">Revenue by day</h2>
          <p className="mt-1 text-xs text-admin-muted">
            Sum of every existing order total, grouped by day in Asia/Kolkata.{" "}
            {orders.length === 1 ? "1 order." : `${orders.length} orders.`}
          </p>
          <div className="mt-4">
            <RevenueChart points={[...byDay.values()]} />
          </div>
        </article>
      </section>
    </div>
  );
}
