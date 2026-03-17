export interface FrameworkConfig {
	readonly name: string;
	readonly version: string;
	readonly locale: string;
	readonly timezone: string;
	readonly debugMode: boolean;
	readonly logLevel: "error" | "warn" | "info" | "debug";
}

export interface EnvironmentConfig {
	readonly databaseUrl: string;
	readonly redisUrl: string;
}
