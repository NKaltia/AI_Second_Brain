import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';
import { config } from './config.js';

const pool = new Pool({ connectionString: config.databaseUrl });
const adapter = new PrismaPg(pool);

const prismaLog =
    config.nodeEnv === 'development'
        ? (['query', 'info', 'warn', 'error'] as const)
        : (['warn', 'error'] as const);

export const prisma = new PrismaClient({
    adapter,
    log: [...prismaLog],
});
