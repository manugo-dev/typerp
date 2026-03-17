import type { createDatabaseClient, eq, schema } from "@typerp/database";
import type { getRedisConnection } from "@typerp/redis";

export interface KernelDatabase {
	readonly db: ReturnType<typeof createDatabaseClient>;
	readonly eq: typeof eq;
	readonly schema: typeof schema;
}

export interface KernelRedis {
	readonly connection: ReturnType<typeof getRedisConnection>;
}
