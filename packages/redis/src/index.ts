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

function getRedisUrl(): string {
	const url = "";
	if (!url) {
		throw new Error(
			"[Redis] REDIS_URL is not configured. Set REDIS_URL as an environment variable.",
		);
	}
	return url;
}

export function getRedisConnection(): Redis {
	if (!sharedRedisConnection) {
		// BullMQ requires maxRetriesPerRequest: null — we disable the eslint rule for this one line
		// because the ioredis types conflict with strictOptionalProperties under exactOptionalPropertyTypes.
		const options: RedisOptions = {
			maxRetriesPerRequest: null as unknown as number,
		};
		sharedRedisConnection = new Redis(getRedisUrl(), options);
	}
	return sharedRedisConnection;
}

export { Redis };
export type { RedisOptions };
