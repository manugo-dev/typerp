import { createDatabaseClient, schema, eq } from '@trp/database';
import { createQueue, getRedisConnection } from '@trp/redis';

export interface KernelInfrastructureServices {
  readonly database: {
    readonly db: ReturnType<typeof createDatabaseClient>;
    readonly schema: typeof schema;
    readonly eq: typeof eq;
  };
  readonly redis: {
    readonly connection: ReturnType<typeof getRedisConnection>;
    createQueue: typeof createQueue;
  };
}

let cachedServices: KernelInfrastructureServices | null = null;

export function initializeInfrastructureServices(): KernelInfrastructureServices {
  if (cachedServices) {
    return cachedServices;
  }

  const db = createDatabaseClient();
  const connection = getRedisConnection();

  cachedServices = {
    database: {
      db,
      schema,
      eq,
    },
    redis: {
      connection,
      createQueue,
    },
  };

  return cachedServices;
}
