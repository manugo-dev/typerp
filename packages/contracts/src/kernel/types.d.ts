import type { createDatabaseClient, eq, schema } from "@typerp/database";
import type { getRedisConnection } from "@typerp/redis";

export interface KernelDatabaseServices {
	readonly db: ReturnType<typeof createDatabaseClient>;
	readonly eq: typeof eq;
	readonly schema: typeof schema;
}

export interface KernelInfrastructureServices {
	readonly database: KernelDatabaseServices;
	readonly redis: {
		readonly connection: ReturnType<typeof getRedisConnection>;
	};
}
