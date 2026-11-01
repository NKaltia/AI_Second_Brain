import 'dotenv/config';
import { defineConfig } from 'vitest/config';

// config.ts fail-fast runs on first import — env must exist before tests load src/
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-jwt-secret-at-least-32-characters-long';
process.env.GEMINI_API_KEY ??= 'test-gemini-key-unused-in-http-tests';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        fileParallelism: false,
        hookTimeout: 60_000,
        testTimeout: 30_000,
    },
});
