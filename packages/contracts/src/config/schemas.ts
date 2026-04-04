import { z } from "zod";

export const FrameworkConfigSchema = z.object({
	debugMode: z.boolean().default(false),
	fallbackLocale: z.string().min(2).default("en"),
	locale: z.string().min(2).default("en"),
	logLevel: z.enum(["error", "warn", "info", "debug"]).default("info"),
	name: z.string().min(1),
	supportedLocales: z.array(z.string().min(2)).nonempty().default(["en"]),
	timezone: z.string().min(1).default("UTC"),
	version: z.string().min(1),
});

export const EnvironmentConfigSchema = z.object({
	databaseUrl: z.string().min(1),
	redisUrl: z.string().min(1),
});
