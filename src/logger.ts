import pino from 'pino';
import { config } from './config.js';

/**
 * App-wide structured logger.
 * In production: JSON lines (easy to search on Render).
 * In development: still JSON by default; add pino-pretty for colors.
 */
export const logger = pino({
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
});
