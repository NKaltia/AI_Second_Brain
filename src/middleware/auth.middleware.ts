import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRequest } from '../interfaces/express.interface.js';
import { config } from '../config.js';
import { AppError } from '../utils/errors.js';

export const authMiddleware = (req: UserRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError(401, 'Unauthorized'));
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string, email: string };
        req.user = decoded;
        next();
    } catch {
        // Invalid/expired token → 401 (not authenticated), not 403 (authenticated but forbidden)
        next(new AppError(401, 'Invalid token'));
    }
};
