import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRequest } from '../interfaces/express.interface.js';
import { config } from '../config.js';

export const authMiddleware = (req: UserRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string, email: string };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' })
    }
};
