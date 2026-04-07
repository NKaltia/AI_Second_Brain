import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Включаем логирование запросов, чтобы видеть магию SQL прямо в терминале!
export const prisma = new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error']
});
