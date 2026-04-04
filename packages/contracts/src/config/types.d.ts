export interface FrameworkConfig {
	readonly debugMode: boolean;
	readonly fallbackLocale: string;
	readonly locale: string;
	readonly logLevel: "debug" | "error" | "info" | "warn";
	readonly name: string;
	readonly supportedLocales: readonly string[];
	readonly timezone: string;
	readonly version: string;
}

export interface EnvironmentConfig {
	readonly databaseUrl: string;
	readonly redisUrl: string;
}
