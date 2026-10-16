"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isPrismaError, prisma } from "@/lib/prisma";
import {
  normalizeTokenList,
  parseImageList,
  serializeImageUrls,
  slugFromName,
  type ProductFormState,
} from "@/components/admin/products-query";

function uniqueConflict(error: unknown): string | null {
  if (!isPrismaError(error, "P2002")) return null;
  const target = error.meta?.target;
  const fields = Array.isArray(target) ? target.join(",") : String(target ?? "");
  if (fields.includes("sku")) return "That SKU is already in use.";
  if (fields.includes("slug")) return "A product with this name already exists. Change the name so its slug is unique.";
  return "That product already exists.";
}

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

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isUploadedProductImage(value: string): boolean {
  return /^\/uploads\/products\/[A-Za-z0-9][A-Za-z0-9._-]{0,180}$/.test(value);
}

function refreshProductViews(slugs: string[]) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/product/${slug}`);
  }
}

export async function setProductActive(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const activeRaw = String(formData.get("active") ?? "");
  if (!id || (activeRaw !== "true" && activeRaw !== "false")) return;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { active: activeRaw === "true" },
      select: { slug: true },
    });
    refreshProductViews([product.slug]);
    revalidatePath(`/admin/products/${id}`);
  } catch (error) {
    if (isPrismaError(error, "P2025")) return;
    throw error;
  }
}

export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const productId = String(formData.get("productId") ?? "").trim();
  const name = String(formData.get("name") ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const sku = String(formData.get("sku") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const sizes = normalizeTokenList(String(formData.get("sizes") ?? ""));
  const colors = normalizeTokenList(String(formData.get("colors") ?? ""));
  const imageRaw = String(formData.get("imageUrls") ?? "");
  const active = formData.get("active") === "on" || formData.get("active") === "true";

  if (!name) return { error: "Enter a product name." };
  if (name.length > 120) return { error: "Name must be 120 characters or fewer." };
  if (!sku) return { error: "Enter a SKU." };
  if (sku.length > 64) return { error: "SKU must be 64 characters or fewer." };
  if (!description) return { error: "Enter a description." };
  if (description.length > 5000) return { error: "Description must be 5,000 characters or fewer." };
  if (sizes.length > 200) return { error: "Sizes must be 200 characters or fewer." };
  if (colors.length > 200) return { error: "Colors must be 200 characters or fewer." };
  if (imageRaw.length > 8000) return { error: "Image URLs are too long." };
  if (!categoryId) return { error: "Choose a category." };

  const slug = slugFromName(name);
  if (!slug) return { error: "Enter a name that includes letters or numbers." };

  const price = parseWhole(formData.get("price"), "Price", 10_000_000);
  if (!price.ok) return { error: price.error };
  const mrp = parseWhole(formData.get("mrp"), "MRP", 10_000_000);
  if (!mrp.ok) return { error: mrp.error };
  const stock = parseWhole(formData.get("stock"), "Stock", 1_000_000);
  if (!stock.ok) return { error: stock.error };

  const urls = parseImageList(imageRaw);
  if (urls.length > 8) return { error: "Add up to 8 image URLs." };
  if (urls.some((url) => url.length > 2000 || (!isHttpUrl(url) && !isUploadedProductImage(url)))) {
    return { error: "Each image must be an http or https URL, or an uploaded product image." };
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) return { error: "Choose a category." };

  let previousSlug = "";
  if (productId) {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    });
    if (!existing) return { error: "This product no longer exists." };
    previousSlug = existing.slug;
  }

  const [skuOwner, slugOwner] = await Promise.all([
    prisma.product.findUnique({ where: { sku }, select: { id: true } }),
    prisma.product.findUnique({ where: { slug }, select: { id: true } }),
  ]);
  if (skuOwner && skuOwner.id !== productId) return { error: "That SKU is already in use." };
  if (slugOwner && slugOwner.id !== productId) {
    return { error: "A product with this name already exists. Change the name so its slug is unique." };
  }

  const data = {
    name,
    slug,
    sku,
    description,
    price: price.value,
    mrp: mrp.value,
    stock: stock.value,
    active,
    sizes,
    colors,
    imageUrls: serializeImageUrls(urls),
    categoryId,
  };

  try {
    if (productId) {
      await prisma.product.update({ where: { id: productId }, data });
    } else {
      await prisma.product.create({ data });
    }
  } catch (error) {
    const message = uniqueConflict(error);
    if (message) return { error: message };
    if (isPrismaError(error, "P2025")) {
      return { error: "This product no longer exists." };
    }
    throw error;
  }

  refreshProductViews([slug, previousSlug]);
  if (productId) revalidatePath(`/admin/products/${productId}`);
  redirect(productId ? "/admin/products?notice=saved" : "/admin/products?notice=created");
}
