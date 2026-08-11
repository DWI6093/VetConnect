import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'ts-node ./prisma/seed.ts',
  },
  // Prisma Client puede generarse durante el build sin conectarse a una BD.
  // Los comandos de migración seguirán requiriendo una URL, proporcionada por Compose.
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
