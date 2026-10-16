import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function isPostgresUrl(value: string | undefined): value is string {
  return Boolean(value && (value.startsWith("postgres://") || value.startsWith("postgresql://")));
}

export function loadNeonEnvFile() {
  const file = path.join(process.cwd(), ".env.neon.local");
  if (!existsSync(file)) return false;

  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }

  return true;
}
