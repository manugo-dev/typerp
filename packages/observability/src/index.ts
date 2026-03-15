import pino from 'pino';
import { getConfig } from '@trp/config';

let sharedLogger: pino.Logger;

export function getLogger(name: string = 'trp-framework'): pino.Logger {
  if (!sharedLogger) {
    const config = getConfig();
    const options: pino.LoggerOptions = {
      name,
      level: config.DEBUG_MODE ? 'debug' : 'info',
    };
    if (config.DEBUG_MODE) {
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
