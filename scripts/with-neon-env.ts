import { spawn } from "node:child_process";
import { isPostgresUrl, loadNeonEnvFile } from "./neon-env";

if (!loadNeonEnvFile()) {
  console.error("Create .env.neon.local with DATABASE_URL (pooled Neon URL) and DIRECT_URL (direct Neon URL).");
  process.exit(1);
}

if (!isPostgresUrl(process.env.DATABASE_URL)) {
  console.error("DATABASE_URL in .env.neon.local must be a postgres connection string.");
  process.exit(1);
}

if (!isPostgresUrl(process.env.DIRECT_URL)) {
  console.error("DIRECT_URL in .env.neon.local must be the direct Neon connection string.");
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: tsx scripts/with-neon-env.ts <command> [...args]");
  process.exit(1);
}

const child = spawn(args[0], args.slice(1), {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 1));
