import { createDatabaseClient, eq, schema } from "@typerp/database";
import { createQueue, getRedisConnection } from "@typerp/redis";

export interface KernelInfrastructureServices {
	readonly database: {
		readonly db: ReturnType<typeof createDatabaseClient>;
		readonly eq: typeof eq;
		readonly schema: typeof schema;
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

	const database = createDatabaseClient();
	const connection = getRedisConnection();

	cachedServices = {
		database: {
			db: database,
			eq,
			schema,
		},
		redis: {
			connection,
			createQueue,
		},
	};

	return cachedServices;
}
