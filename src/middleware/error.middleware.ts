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
    // Always log the real error on the server (stack, Prisma text, …). Never send that to the client.
    console.error(err);

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    res.status(500).json({ error: 'Internal server error' });
}
