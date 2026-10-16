"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SettingsFormState = { error: string } | { ok: true } | null;

function parseWhole(
  value: FormDataEntryValue | null,
  label: string,
  max: number,
): { ok: true; value: number } | { ok: false; error: string } {
  const raw = String(value ?? "").trim();
  if (!/^\d+$/.test(raw)) return { ok: false, error: `${label} must be a whole number.` };
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed > max) {
    return { ok: false, error: `${label} must be ${max.toLocaleString("en-IN")} or less.` };
  }
  return { ok: true, value: parsed };
}

export async function saveSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const storeName = String(formData.get("storeName") ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const supportEmail = String(formData.get("supportEmail") ?? "").trim();
  if (!storeName) return { error: "Enter a store name." };
  if (storeName.length > 80) return { error: "Store name must be 80 characters or fewer." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail) || supportEmail.length > 120) {
    return { error: "Enter a valid support email." };
  }

  const gstThreshold = parseWhole(formData.get("gstThreshold"), "GST threshold", 10_000_000);
  if (!gstThreshold.ok) return { error: gstThreshold.error };
  const gstLowRate = parseWhole(formData.get("gstLowRate"), "Low GST rate", 100);
  if (!gstLowRate.ok) return { error: gstLowRate.error };
  const gstHighRate = parseWhole(formData.get("gstHighRate"), "High GST rate", 100);
  if (!gstHighRate.ok) return { error: gstHighRate.error };

  const data = {
    storeName,
    supportEmail,
    gstThreshold: gstThreshold.value,
    gstLowRate: gstLowRate.value,
    gstHighRate: gstHighRate.value,
  };

  await prisma.storeSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/shop");
  return { ok: true };
}
