export interface FrameworkConfig {
	readonly debugMode: boolean;
	readonly locale: string;
	readonly logLevel: "debug" | "error" | "info" | "warn";
	readonly name: string;
	readonly timezone: string;
	readonly version: string;
}

export interface EnvironmentConfig {
	readonly databaseUrl: string;
	readonly redisUrl: string;
}
