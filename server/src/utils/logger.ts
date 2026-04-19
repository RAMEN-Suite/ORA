import pino, { Logger } from 'pino';
import pinoHttp, { HttpLogger } from 'pino-http';

export const logger: Logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const httpLogger: HttpLogger = pinoHttp({ logger });
