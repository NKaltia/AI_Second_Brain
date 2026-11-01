import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

const app = createApp();

describe('HTTP body errors', () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('malformed JSON → 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .set('Content-Type', 'application/json')
            .send('{"email":');

        expect(res.status).toBe(400);
    });

    it('oversized body → 413', async () => {
        const big = 'x'.repeat(150_000);
        const res = await request(app)
            .post('/auth/login')
            .set('Content-Type', 'application/json')
            .send(`{"email":"a@b.co","password":"${big}"}`);

        expect(res.status).toBe(413);
    });
});
