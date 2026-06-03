import pino from 'pino';
import { isProd } from './env';

export const logger = pino({
  level: isProd ? 'info' : 'debug'
});
