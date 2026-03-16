import pino from 'pino';
import { getConfig } from '@typerp/config';

let sharedLogger: pino.Logger;

export function getLogger(name: string = 'typerp'): pino.Logger {
  if (!sharedLogger) {
    const config = getConfig();
    const options: pino.LoggerOptions = {
      name,
      level: config.debugMode ? 'debug' : config.logLevel,
    };
    if (config.debugMode) {
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
