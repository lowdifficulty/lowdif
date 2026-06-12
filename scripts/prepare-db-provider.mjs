import fs from "fs";
import path from "path";

function loadDatabaseUrlFromEnvFile() {
  if (process.env.DATABASE_URL) return;
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^DATABASE_URL\s*=\s*(.+)$/);
    if (!match) continue;
    let value = match[1].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env.DATABASE_URL = value;
    break;
  }
}

loadDatabaseUrlFromEnvFile();

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const url = process.env.DATABASE_URL ?? "";
const provider = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : "sqlite";

const schema = fs.readFileSync(schemaPath, "utf8");
const next = schema.replace(
  /provider\s*=\s*"(?:sqlite|postgresql)"/,
  `provider = "${provider}"`
);

if (next !== schema) {
  fs.writeFileSync(schemaPath, next);
}

console.log(`Prisma datasource: ${provider}`);
