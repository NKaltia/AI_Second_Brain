import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRequest } from '../interfaces/express.interface.js';
import { config } from '../config.js';
import { AppError } from '../utils/errors.js';
import { accessTokenPayloadSchema } from '../validation/schemas.js';

export const authMiddleware = (req: UserRequest, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[config.accessCookieName];

    if (typeof token !== 'string' || token.length === 0) {
        return next(new AppError(401, 'Unauthorized'));
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret, {
            algorithms: ['HS256'],
        });
        const payload = accessTokenPayloadSchema.parse(decoded);
        req.user = payload;
        next();
    } catch {
        // Invalid/expired token → 401 (not authenticated), not 403 (authenticated but forbidden)
        next(new AppError(401, 'Invalid token'));
    }
};
