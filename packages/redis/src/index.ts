import { Redis, type RedisOptions } from "ioredis";

export { Redis, type RedisOptions } from "ioredis";

let sharedRedisConnection: Redis | undefined;

export function getRedisConnection(redisUrl: string): Redis {
	if (!sharedRedisConnection) {
		// BullMQ requires maxRetriesPerRequest: null
		const options: RedisOptions = {
			maxRetriesPerRequest: null as unknown as number,
		};
		sharedRedisConnection = new Redis(redisUrl, options);
	}
	return sharedRedisConnection;
}
