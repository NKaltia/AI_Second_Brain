import bcrypt from 'bcryptjs';
import type { Response } from 'supertest';
import { prisma } from '../src/db.js';
import { config } from '../src/config.js';

/** Create a password user without hitting Gemini (register would embed a welcome note). */
export async function createPasswordUser(email: string, password: string) {
    return prisma.user.create({
        data: {
            email,
            password: await bcrypt.hash(password, 10),
        },
    });
}

export function cookieFrom(res: Response, name: string): string | undefined {
    const header = res.headers['set-cookie'];
    if (!header) return undefined;
    const lines = Array.isArray(header) ? header : [header];
    for (const line of lines) {
        if (line.startsWith(`${name}=`)) {
            return decodeURIComponent(line.slice(name.length + 1).split(';')[0]!);
        }
    }
    return undefined;
}

export function authCookieHeader(accessToken: string, refreshToken?: string): string {
    const parts = [`${config.accessCookieName}=${accessToken}`];
    if (refreshToken) {
        parts.push(`${config.refreshCookieName}=${refreshToken}`);
    }
    return parts.join('; ');
}

export async function cleanupUserByEmail(email: string) {
    await prisma.user.deleteMany({ where: { email } });
}
