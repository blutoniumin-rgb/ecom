import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";
import { PrismaClient as PostgresClient } from "@prisma/neon-client";
import ws from "ws";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function isPostgresUrl(value: string) {
  return value.startsWith("postgres://") || value.startsWith("postgresql://");
}

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";
  if (!isPostgresUrl(url)) return new PrismaClient();

  if (!process.env.DIRECT_URL) process.env.DIRECT_URL = url;
  neonConfig.webSocketConstructor = ws;
  const adapter = new PrismaNeon({ connectionString: url });
  return new PostgresClient({ adapter }) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isPrismaError(
  error: unknown,
  code: string,
): error is { code: string; meta?: { target?: unknown } } {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
