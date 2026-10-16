import { connection } from "next/server";
import { SettingsForm } from "@/components/admin/settings-form";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "Settings · Wearism Admin",
};

export default async function AdminSettingsPage() {
  await connection();
  const razorpayKeySet = Boolean(process.env.RAZORPAY_KEY_ID?.trim());
  const setting = await prisma.storeSetting.findUnique({ where: { id: "singleton" } });
  const initial = {
    storeName: setting?.storeName ?? "Wearism",
    supportEmail: setting?.supportEmail ?? "",
    gstThreshold: setting?.gstThreshold ?? 1000,
    gstLowRate: setting?.gstLowRate ?? 5,
    gstHighRate: setting?.gstHighRate ?? 12,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-admin-muted">Store name, support email, and GST rates.</p>
      <section className="mt-5 rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
        <SettingsForm initial={initial} />
        <div className="mt-6 border-t border-black/[0.06] pt-5">
          <h2 className="text-base font-semibold">Razorpay</h2>
          <p className="mt-2 text-sm text-admin-muted">
            Key ID is{" "}
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                razorpayKeySet ? "bg-[#ecfdf3] text-[#166534]" : "bg-admin-bg text-admin-muted"
              }`}
            >
              {razorpayKeySet ? "set" : "not set"}
            </span>{" "}
            in the environment. Keys stay in the environment and are not stored in the database.
          </p>
        </div>
      </section>
    </div>
  );
}
