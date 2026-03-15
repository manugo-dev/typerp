import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getConfig } from '@trp/config';
import * as schema from './schema/index';

export function createDatabaseClient() {
  const config = getConfig();
  const databaseUrl = config.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      '[Database] DATABASE_URL is not configured. Set DATABASE_URL as an environment variable.',
    );
  }

  const queryClient = postgres(databaseUrl, { max: 10 });
  return drizzle(queryClient, { schema });
}

export { schema };
export * from 'drizzle-orm';
