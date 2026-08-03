import "dotenv/config";
import { defineConfig } from "@prisma/config";

const databaseUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Configura DIRECT_DATABASE_URL o DATABASE_URL para ejecutar Prisma.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "ts-node ./prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
