import { connection } from "next/server";
import { ProductEditor } from "@/components/admin/products-form";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "Add product · Wearism Admin",
};

export default async function NewProductPage() {
  await connection();
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <ProductEditor
      title="Add new product"
      productId=""
      categories={categories}
      initial={{
        name: "",
        sku: "",
        description: "",
        price: "",
        mrp: "",
        stock: "",
        categoryId: categories[0]?.id ?? "",
        sizes: "",
        colors: "",
        imageUrls: "",
        active: true,
      }}
    />
  );
}
