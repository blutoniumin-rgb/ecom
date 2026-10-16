import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };

function isPostgres(value) {
  return typeof value === "string" && (value.startsWith("postgres://") || value.startsWith("postgresql://"));
}

if (!isPostgres(env.DATABASE_URL)) {
  env.DATABASE_URL = "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder";
}
if (!isPostgres(env.DIRECT_URL)) {
  env.DIRECT_URL = "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder";
}

const prismaBin = path.join(root, "node_modules", ".bin", "prisma");

function run(args, runEnv) {
  const result = spawnSync(prismaBin, args, {
    cwd: root,
    env: runEnv,
    stdio: "inherit",
  });
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
}

// The default schema is SQLite. Generate it with a file URL so a Postgres
// DATABASE_URL on Vercel does not fail this step.
run(["generate"], {
  ...process.env,
  DATABASE_URL: "file:./dev.db",
});

run(["generate", "--schema", "prisma/postgres/schema.prisma"], env);
