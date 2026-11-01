import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';
import { config } from '../src/config.js';
import {
    authCookieHeader,
    cleanupUserByEmail,
    cookieFrom,
    createPasswordUser,
} from './helpers.js';

const app = createApp();
const email = `auth-${Date.now()}@example.com`;
const password = 'secret12';

describe('auth cookies + refresh', () => {
    beforeAll(async () => {
        await createPasswordUser(email, password);
    });

    afterAll(async () => {
        await cleanupUserByEmail(email);
        await prisma.$disconnect();
    });

    it('login sets httpOnly access + refresh cookies', async () => {
        const res = await request(app).post('/auth/login').send({ email, password });

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(email);
        expect(res.body.token).toBeUndefined();

        const access = cookieFrom(res, config.accessCookieName);
        const refresh = cookieFrom(res, config.refreshCookieName);
        expect(access).toBeTruthy();
        expect(refresh).toBeTruthy();
        // Access is a JWT; refresh is an opaque string
        expect(access!.split('.')).toHaveLength(3);
        expect(refresh!.includes('.')).toBe(false);
    });

    it('refresh rotates tokens; reused old refresh returns 401', async () => {
        const login = await request(app).post('/auth/login').send({ email, password });
        const access1 = cookieFrom(login, config.accessCookieName)!;
        const refresh1 = cookieFrom(login, config.refreshCookieName)!;

        const refreshed = await request(app)
            .post('/auth/refresh')
            .set('Cookie', authCookieHeader(access1, refresh1));

        expect(refreshed.status).toBe(200);
        const access2 = cookieFrom(refreshed, config.accessCookieName)!;
        const refresh2 = cookieFrom(refreshed, config.refreshCookieName)!;
        expect(refresh2).not.toBe(refresh1);
        expect(access2).toBeTruthy();

        const reuse = await request(app)
            .post('/auth/refresh')
            .set('Cookie', authCookieHeader(access2, refresh1));

        expect(reuse.status).toBe(401);

        // Family revoked — even the rotated refresh should fail after reuse detection
        const afterReuse = await request(app)
            .post('/auth/refresh')
            .set('Cookie', authCookieHeader(access2, refresh2));
        expect(afterReuse.status).toBe(401);
    });

    it('logout clears session cookies', async () => {
        const login = await request(app).post('/auth/login').send({ email, password });
        const access = cookieFrom(login, config.accessCookieName)!;
        const refresh = cookieFrom(login, config.refreshCookieName)!;

        const logout = await request(app)
            .post('/auth/logout')
            .set('Cookie', authCookieHeader(access, refresh));

        expect(logout.status).toBe(204);

        const refreshAgain = await request(app)
            .post('/auth/refresh')
            .set('Cookie', authCookieHeader(access, refresh));
        expect(refreshAgain.status).toBe(401);
    });
});
