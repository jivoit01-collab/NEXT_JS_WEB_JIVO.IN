import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

export default defineConfig({
  schema: path.join('prisma', 'schema'),
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
