import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/profile-form";

export const instant = false;

export const metadata = {
  title: "Account · Wearism",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  const [{ saved, error }, user] = await Promise.all([
    searchParams,
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, phone: true },
    }),
  ]);

  if (!user) redirect("/login?next=/account");

  return (
    <section>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Profile</h1>
      <p className="mt-2 text-sm text-muted">Update the name and phone on your Wearism account.</p>
      <ProfileForm
        name={user.name}
        email={user.email}
        phone={user.phone ?? ""}
        saved={saved === "1"}
        error={error}
      />
    </section>
  );
}
