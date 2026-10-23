import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../logger.js';

function requestIdOf(req: Request): string | undefined {
    const id = req.id;
    return typeof id === 'string' ? id : undefined;
}

/**
 * Express error middleware — must have 4 parameters so Express registers it as such.
 * Place AFTER all routes in index.ts.
 */
export function errorMiddleware(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const requestId = requestIdOf(req);
    const log = req.log ?? logger;
    log.error({ err, requestId }, 'request failed');

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message, requestId });
        return;
    }

    if (typeof err === 'object' && err != null && 'type' in err) {
        if (err.type === 'entity.parse.failed') {
            res.status(400).json({ error: 'Invalid JSON body', requestId });
            return;
        }
        if (err.type === 'entity.too.large') {
            res.status(413).json({ error: 'Request body too large', requestId });
            return;
        }
    }

    res.status(500).json({ error: 'Internal server error', requestId });
}
