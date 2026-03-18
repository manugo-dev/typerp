import pino from "pino";

export type { Logger } from "pino";

let sharedLogger: pino.Logger | undefined;
let bootstrapOptions: LoggerBootstrapOptions | null = null;

export interface LoggerBootstrapOptions {
	readonly debugMode?: boolean;
	readonly level?: "debug" | "error" | "info" | "warn";
	readonly name?: string;
}

export function initializeLogger(options: LoggerBootstrapOptions = {}): void {
	bootstrapOptions = options;
	sharedLogger = undefined;
}

export function getLogger(name: string = "typerp"): pino.Logger {
	if (!sharedLogger) {
		const resolvedOptions = bootstrapOptions ?? {};
		const options: pino.LoggerOptions = {
			level: resolvedOptions.debugMode ? "debug" : (resolvedOptions.level ?? "info"),
			name: resolvedOptions.name ?? name,
		};
		if (resolvedOptions.debugMode) {
			options.transport = {
				options: { colorize: true },
				target: "pino-pretty",
			};
		}
		sharedLogger = pino(options);
	}
	return sharedLogger.child({ module: name });
}
