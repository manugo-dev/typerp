import { defineConfig } from 'drizzle-kit';
import { getConfig } from '@trp/config';

// Load config manually for CLI tools out-of-bounds
const config = getConfig();

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
