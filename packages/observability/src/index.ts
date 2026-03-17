import pino from 'pino';

let sharedLogger: pino.Logger | undefined;

export interface LoggerBootstrapOptions {
	readonly debugMode?: boolean;
	readonly level?: 'error' | 'warn' | 'info' | 'debug';
	readonly name?: string;
}

let bootstrapOptions: LoggerBootstrapOptions | null = null;

export function initializeLogger(options: LoggerBootstrapOptions = {}): void {
	bootstrapOptions = options;
	sharedLogger = undefined;
}

export function getLogger(name: string = 'typerp'): pino.Logger {
  if (!sharedLogger) {
    const resolvedOptions = bootstrapOptions ?? {};
    const options: pino.LoggerOptions = {
      name: resolvedOptions.name ?? name,
      level: resolvedOptions.debugMode ? 'debug' : (resolvedOptions.level ?? 'info'),
    };
    if (resolvedOptions.debugMode) {
      options.transport = {
        target: 'pino-pretty',
        options: { colorize: true },
      };
    }
    sharedLogger = pino(options);
  }
  return sharedLogger.child({ module: name });
}

export { pino };
