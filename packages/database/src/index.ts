import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getConfig } from '@trp/config';
import * as schema from './schema';

const config = getConfig();

const databaseUrl = config.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('[Database] DATABASE_URL is not configured. Set DATABASE_URL as an environment variable.');
}

// Basic healthcheck-friendly connection pattern
const queryClient = postgres(databaseUrl, { max: 10 });
export const db = drizzle(queryClient, { schema });

// Re-export common concepts for downstream modules
export { schema };
export * from 'drizzle-orm';
