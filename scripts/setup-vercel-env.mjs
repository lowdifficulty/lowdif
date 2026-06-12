import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function readEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  const vars = {};
  if (!fs.existsSync(envPath)) return vars;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[match[1]] = value;
  }
  return vars;
}

function toPooledDatabaseUrl(url) {
  if (!url || url.includes("-pooler.")) return url;
  return url.replace(/@ep-([^.]+)\./, "@ep-$1-pooler.");
}

function addEnv(name, value, target, branch) {
  if (!value) return;
  const branchArg = branch ? ` ${branch}` : "";
  console.log(`Setting ${name} for ${target}${branchArg}...`);
  execSync(
    `npx vercel@latest env add ${name} ${target}${branchArg} --value ${JSON.stringify(value)} --yes --force`,
    { stdio: ["ignore", "inherit", "inherit"] }
  );
}

const env = readEnvFile();
const databaseUrl = toPooledDatabaseUrl(env.DATABASE_URL);
const targets = ["production", "preview"];

for (const target of targets) {
  if (target === "preview") {
    addEnv("DATABASE_URL", databaseUrl, target, "main");
    addEnv("JWT_SECRET", env.JWT_SECRET, target, "main");
    addEnv("LOWDIF_TOKEN_SYMBOL", env.LOWDIF_TOKEN_SYMBOL || "LOWDIF", target, "main");
    addEnv(
      "LOWDIF_TOKENS_PER_LISTEN",
      env.LOWDIF_TOKENS_PER_LISTEN || "1",
      target,
      "main"
    );
    continue;
  }
  addEnv("DATABASE_URL", databaseUrl, target);
  addEnv("JWT_SECRET", env.JWT_SECRET, target);
  addEnv("LOWDIF_TOKEN_SYMBOL", env.LOWDIF_TOKEN_SYMBOL || "LOWDIF", target);
  addEnv(
    "LOWDIF_TOKENS_PER_LISTEN",
    env.LOWDIF_TOKENS_PER_LISTEN || "1",
    target
  );
}

addEnv("NEXT_PUBLIC_APP_URL", "https://app.lowdif.com", "production");

console.log("Vercel environment variables configured.");
