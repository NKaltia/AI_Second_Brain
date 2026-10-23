import type { Request, Response } from 'express';
import { prisma } from '../db.js';
import { logger } from '../logger.js';

export const healthCheck = async (_req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        logger.error({ err: error }, 'Health check failed');
        res.status(503).json({ status: 'error' });
    }
};
