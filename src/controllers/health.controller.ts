import type { Request, Response } from 'express';
import { prisma } from '../db.js';

export const healthCheck = async (_req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({ status: 'error' });
    }
};
