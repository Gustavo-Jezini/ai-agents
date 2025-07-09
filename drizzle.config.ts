import { defineConfig } from 'drizzle-kit';
import { env } from './src/env.ts';

export default defineConfig({
  dialect: 'postgresql',
  casing: 'snake_case',
  schema: './src/db/schema/**.ts',
  out: './src/db/migrations', // Qual é o caminho da pasta que serão criados os arquivos SQL
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
