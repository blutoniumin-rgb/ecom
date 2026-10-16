import { connection } from "next/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "Wearism Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const [admin, openOrderCount] = await Promise.all([
    prisma.user.findUnique({
      where: { email: "admin@wearism.dev" },
      select: { name: true },
    }),
    prisma.order.count({
      where: { status: { not: "delivered" } },
    }),
  ]);

  return (
    <AdminShell
      adminName={admin?.name ?? "Wearism Admin"}
      storeName="Wearism"
      openOrderCount={openOrderCount}
    >
      {children}
    </AdminShell>
  );
}
