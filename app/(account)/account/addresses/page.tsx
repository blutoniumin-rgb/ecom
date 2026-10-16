import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressBook } from "@/components/account/address-book";

export const instant = false;

export const metadata = {
  title: "Addresses · Wearism",
};

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; error?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/account/addresses");

  const [{ edit, error }, addresses] = await Promise.all([
    searchParams,
    prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
  ]);

  return (
    <section>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Addresses</h1>
      <p className="mt-2 text-sm text-muted">Saved delivery addresses. Only one can be the default.</p>
      <AddressBook addresses={addresses} editingId={edit} error={error} />
    </section>
  );
}
