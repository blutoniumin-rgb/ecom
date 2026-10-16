import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient as SqliteClient } from "@prisma/client";
import { existsSync } from "node:fs";
import path from "node:path";
import ws from "ws";
import { PrismaClient as PostgresClient } from "@prisma/neon-client";
import { isPostgresUrl, loadNeonEnvFile } from "./neon-env";

const loadedFile = loadNeonEnvFile();
const databaseUrl = process.env.DATABASE_URL;

if (!isPostgresUrl(databaseUrl)) {
  console.error(
    loadedFile
      ? "Refusing to copy: DATABASE_URL in .env.neon.local is not a postgres connection string."
      : "Refusing to copy: set DATABASE_URL to a postgres connection string in .env.neon.local.",
  );
  console.error("This script reads prisma/dev.db and does not change that file.");
  process.exit(1);
}

const sqliteFile = path.join(process.cwd(), "prisma", "dev.db");
if (!existsSync(sqliteFile)) {
  console.error(`Refusing to copy: ${sqliteFile} does not exist.`);
  process.exit(1);
}

if (!process.env.DIRECT_URL) process.env.DIRECT_URL = databaseUrl;
neonConfig.webSocketConstructor = ws;

const sqlite = new SqliteClient({
  datasources: { db: { url: `file:${sqliteFile}` } },
});
const neon = new PostgresClient({
  adapter: new PrismaNeon({ connectionString: databaseUrl }),
});

async function main() {
  const [
    settings,
    users,
    categories,
    products,
    addresses,
    resetTokens,
    reviews,
    carts,
    cartItems,
    orders,
    orderItems,
    shipments,
  ] = await Promise.all([
    sqlite.storeSetting.findMany(),
    sqlite.user.findMany(),
    sqlite.category.findMany(),
    sqlite.product.findMany(),
    sqlite.address.findMany(),
    sqlite.passwordResetToken.findMany(),
    sqlite.review.findMany(),
    sqlite.cart.findMany(),
    sqlite.cartItem.findMany(),
    sqlite.order.findMany(),
    sqlite.orderItem.findMany(),
    sqlite.shipment.findMany(),
  ]);

  console.log("Replacing Neon rows with the SQLite snapshot. prisma/dev.db is left unchanged.");

  await neon.$transaction(
    async (tx) => {
      await tx.shipment.deleteMany();
      await tx.orderItem.deleteMany();
      await tx.order.deleteMany();
      await tx.cartItem.deleteMany();
      await tx.cart.deleteMany();
      await tx.review.deleteMany();
      await tx.passwordResetToken.deleteMany();
      await tx.address.deleteMany();
      await tx.product.deleteMany();
      await tx.category.deleteMany();
      await tx.user.deleteMany();
      await tx.storeSetting.deleteMany();

      if (settings.length) await tx.storeSetting.createMany({ data: settings });
      if (users.length) await tx.user.createMany({ data: users });
      if (categories.length) await tx.category.createMany({ data: categories });
      if (products.length) await tx.product.createMany({ data: products });
      if (addresses.length) await tx.address.createMany({ data: addresses });
      if (resetTokens.length) await tx.passwordResetToken.createMany({ data: resetTokens });
      if (reviews.length) await tx.review.createMany({ data: reviews });
      if (carts.length) await tx.cart.createMany({ data: carts });
      if (cartItems.length) await tx.cartItem.createMany({ data: cartItems });
      if (orders.length) await tx.order.createMany({ data: orders });
      if (orderItems.length) await tx.orderItem.createMany({ data: orderItems });
      if (shipments.length) await tx.shipment.createMany({ data: shipments });
    },
    { timeout: 60_000 },
  );

  const copiedProducts = await neon.product.findMany({
    select: { slug: true, imageUrls: true },
    orderBy: { slug: "asc" },
  });
  const withImages = copiedProducts.filter((product) => product.imageUrls.trim().length > 0).length;

  console.log(`Store settings: ${settings.length}`);
  console.log(`Users: ${users.length}`);
  console.log(`Categories: ${categories.length}`);
  console.log(`Products: ${products.length} (${withImages} with image URLs)`);
  console.log(`Addresses: ${addresses.length}`);
  console.log(`Password reset tokens: ${resetTokens.length}`);
  console.log(`Reviews: ${reviews.length}`);
  console.log(`Carts: ${carts.length}`);
  console.log(`Cart items: ${cartItems.length}`);
  console.log(`Orders: ${orders.length}`);
  console.log(`Order items: ${orderItems.length}`);
  console.log(`Shipments: ${shipments.length}`);
}

main()
  .then(async () => {
    await sqlite.$disconnect();
    await neon.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await sqlite.$disconnect();
    await neon.$disconnect();
    process.exit(1);
  });
