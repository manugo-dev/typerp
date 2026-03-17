/**
 * @typerp/redis — Redis connection helpers
 *
 * Context: SERVER only.
 * REDIS_URL must be provided as an environment variable override when running with
 * the JSONC-based config, since connection secrets are not stored in JSONC.
 */
import { Redis, type RedisOptions } from "ioredis";

// Shared singleton connection
let sharedRedisConnection: Redis | undefined;

export function getRedisConnection(redisUrl: string): Redis {
	if (!sharedRedisConnection) {
		// BullMQ requires maxRetriesPerRequest: null — we disable the eslint rule for this one line
		// because the ioredis types conflict with strictOptionalProperties under exactOptionalPropertyTypes.
		const options: RedisOptions = {
			maxRetriesPerRequest: null as unknown as number,
		};
		sharedRedisConnection = new Redis(redisUrl, options);
	}
	return sharedRedisConnection;
}

export { Redis };
export type { RedisOptions };
