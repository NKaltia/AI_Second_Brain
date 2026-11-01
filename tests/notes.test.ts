import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
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
const email = `notes-${Date.now()}@example.com`;
const password = 'secret12';

describe('notes authz', () => {
    let cookieHeader = '';

    beforeAll(async () => {
        await createPasswordUser(email, password);
        const login = await request(app).post('/auth/login').send({ email, password });
        const access = cookieFrom(login, config.accessCookieName)!;
        const refresh = cookieFrom(login, config.refreshCookieName)!;
        cookieHeader = authCookieHeader(access, refresh);
    });

    afterAll(async () => {
        await cleanupUserByEmail(email);
        await prisma.$disconnect();
    });

    it('PUT unknown note → 404', async () => {
        const res = await request(app)
            .put(`/notes/${randomUUID()}`)
            .set('Cookie', cookieHeader)
            .send({ content: 'nope', title: 'x' });

        expect(res.status).toBe(404);
    });

    it('DELETE unknown note → 404', async () => {
        const res = await request(app)
            .delete(`/notes/${randomUUID()}`)
            .set('Cookie', cookieHeader);

        expect(res.status).toBe(404);
    });
});
