"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAccount() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  return session;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateProfile(formData: FormData) {
  const session = await requireAccount();
  const name = text(formData, "name");
  const phone = text(formData, "phone");

  if (name.length < 1 || name.length > 80) {
    redirect("/account?error=Enter your name");
  }
  if (phone.length > 20) {
    redirect("/account?error=Phone number is too long");
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { name, phone: phone || null },
  });
  await setSessionCookie({
    userId: session.userId,
    role: session.role,
    email: session.email,
    name,
  });
  revalidatePath("/account");
  redirect("/account?saved=1");
}

type AddressInput = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

function readAddress(formData: FormData): AddressInput | null {
  const address = {
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    line1: text(formData, "line1"),
    line2: text(formData, "line2"),
    city: text(formData, "city"),
    state: text(formData, "state"),
    postalCode: text(formData, "postalCode"),
    isDefault: formData.get("isDefault") === "on",
  };
  if (
    !address.name ||
    address.name.length > 80 ||
    !address.phone ||
    address.phone.length > 20 ||
    !address.line1 ||
    address.line1.length > 160 ||
    address.line2.length > 160 ||
    !address.city ||
    address.city.length > 80 ||
    !address.state ||
    address.state.length > 80 ||
    !address.postalCode ||
    address.postalCode.length > 12
  ) {
    return null;
  }
  return address;
}

async function saveAddress(userId: string, address: AddressInput, id?: string) {
  await prisma.$transaction(async (tx) => {
    if (address.isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const data = {
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || null,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    };
    if (id) {
      await tx.address.update({ where: { id }, data });
    } else {
      await tx.address.create({ data: { ...data, userId } });
    }
  });
}

export async function createAddress(formData: FormData) {
  const session = await requireAccount();
  const address = readAddress(formData);
  if (!address) redirect("/account/addresses?error=Check the address fields");
  await saveAddress(session.userId, address);
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function updateAddress(formData: FormData) {
  const session = await requireAccount();
  const id = text(formData, "id");
  const address = readAddress(formData);
  if (!id || !address) redirect("/account/addresses?error=Check the address fields");

  const existing = await prisma.address.findFirst({
    where: { id, userId: session.userId },
    select: { id: true },
  });
  if (!existing) redirect("/account/addresses");

  await saveAddress(session.userId, address, id);
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function deleteAddress(formData: FormData) {
  const session = await requireAccount();
  const id = text(formData, "id");
  if (!id) redirect("/account/addresses");
  await prisma.address.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function setDefaultAddress(formData: FormData) {
  const session = await requireAccount();
  const id = text(formData, "id");
  if (!id) redirect("/account/addresses");

  const existing = await prisma.address.findFirst({
    where: { id, userId: session.userId },
    select: { id: true },
  });
  if (!existing) redirect("/account/addresses");

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: session.userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}
