import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

/**
 * Express error middleware — must have 4 parameters so Express registers it as such.
 * Place AFTER all routes in index.ts.
 */
export function errorMiddleware(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error(err);

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    if (typeof err === 'object' && err != null && 'type' in err) {
        if(err.type === 'entity.parse.failed') {
            res.status(400).json({error: 'Invalid JSON body'});
            return;
        }
        if(err.type === 'entity.too.large') {
            res.status(413).json({error: 'Request body too large'});
            return;
        }
    }

    res.status(500).json({ error: 'Internal server error' });
}
