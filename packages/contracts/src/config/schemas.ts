import { z } from "zod/v4";

export const FrameworkConfigSchema = z.object({
	name: z.string().min(1),
	version: z.string().min(1),
	locale: z.string().min(2).default("en"),
	timezone: z.string().min(1).default("UTC"),
	debugMode: z.boolean().default(false),
	logLevel: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export const EnvironmentConfigSchema = z.object({
	databaseUrl: z.string().min(1),
	redisUrl: z.string().min(1),
});
