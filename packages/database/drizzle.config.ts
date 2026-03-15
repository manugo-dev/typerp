import { defineConfig } from 'drizzle-kit';
import { getConfig } from '@trp/config';

// Load config manually for CLI tools out-of-bounds
const config = getConfig();

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/trp_framework',
  },
  verbose: true,
  strict: true,
});
