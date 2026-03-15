import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getConfig } from '@trp/config';
import * as schema from './schema/index.js';

const config = getConfig();

// Basic healthcheck-friendly connection pattern
const queryClient = postgres(config.DATABASE_URL, { max: 10 });
export const db = drizzle(queryClient, { schema });

// Re-export common concepts for downstream modules
export { schema };
export * from 'drizzle-orm';
