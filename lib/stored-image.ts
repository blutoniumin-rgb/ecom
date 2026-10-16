import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;

function isPostgres() {
  const url = process.env.DATABASE_URL ?? "";
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function ensureStoredImages() {
  ready ??= createTable();
  return ready;
}

async function createTable() {
  if (isPostgres()) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StoredImage" (
        "id" TEXT NOT NULL,
        "mime" TEXT NOT NULL,
        "data" BYTEA NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StoredImage_pkey" PRIMARY KEY ("id")
      )
    `);
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "StoredImage" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "mime" TEXT NOT NULL,
      "data" BLOB NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
