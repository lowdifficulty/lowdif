import fs from "fs";
import path from "path";

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
