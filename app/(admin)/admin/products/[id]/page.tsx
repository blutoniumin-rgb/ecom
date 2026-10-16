import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/products-form";
import { imageUrlsToField } from "@/components/admin/products-query";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "Edit product · Wearism Admin",
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        price: true,
        mrp: true,
        stock: true,
        active: true,
        sizes: true,
        colors: true,
        imageUrls: true,
        categoryId: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <ProductEditor
      title="Edit product"
      productId={product.id}
      categories={categories}
      initial={{
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: String(product.price),
        mrp: String(product.mrp),
        stock: String(product.stock),
        categoryId: product.categoryId,
        sizes: product.sizes,
        colors: product.colors,
        imageUrls: imageUrlsToField(product.imageUrls),
        active: product.active,
      }}
    />
  );
}
