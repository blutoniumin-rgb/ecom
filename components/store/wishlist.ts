import { cookies } from "next/headers";

const WISHLIST_COOKIE = "wearism_wishlist";

export async function getWishlistIds(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(WISHLIST_COOKIE)?.value;
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export async function toggleWishlist(formData: FormData) {
  "use server";

  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) return;

  const current = await getWishlistIds();
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId];

  const store = await cookies();
  store.set(WISHLIST_COOKIE, JSON.stringify(next), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 180,
  });
}
