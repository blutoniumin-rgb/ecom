import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "Customers · Wearism Admin",
};

export default async function AdminCustomersPage() {
  await connection();
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      _count: { select: { addresses: true, orders: true } },
    },
  });

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(28,28,28,0.04)] sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
      <p className="mt-1 text-sm text-admin-muted">Accounts with the customer role.</p>
      {customers.length === 0 ? (
        <p className="px-2 py-16 text-center text-sm text-admin-muted">No customers yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">Customers</caption>
            <thead>
              <tr className="text-xs font-medium text-admin-muted">
                <th scope="col" className="px-3 py-3 font-medium">
                  Name
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Phone
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Addresses
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Orders
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-black/[0.06]">
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="font-medium hover:text-admin-accent"
                    >
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-admin-ink/80">{customer.email}</td>
                  <td className="px-3 py-3 tabular-nums">{customer.phone ?? "—"}</td>
                  <td className="px-3 py-3 tabular-nums">{customer._count.addresses}</td>
                  <td className="px-3 py-3 tabular-nums">{customer._count.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
