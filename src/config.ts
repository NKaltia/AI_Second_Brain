import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().min(1, 'must not be empty').url('must be a valid URL'),
    GEMINI_API_KEY: z.string().min(1, 'must not be empty'),
    JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables:');
    for (const issue of parsed.error.issues) {
        const name = String(issue.path[0] ?? 'unknown');
        console.error(`  ${name}: ${issue.message}`);
    }
    process.exit(1);
}

const nodeEnv = parsed.data.NODE_ENV;

// Auth TTLs live here (not in .env): same values in every environment unless we later need ops knobs.
const accessTokenTtlSeconds = 15 * 60; // 15 minutes
const refreshTokenTtlMs = 30 * 24 * 60 * 60 * 1000; // 30 days

export const config = {
    databaseUrl: parsed.data.DATABASE_URL,
    geminiApiKey: parsed.data.GEMINI_API_KEY,
    jwtSecret: parsed.data.JWT_SECRET,
    port: parsed.data.PORT,
    nodeEnv,
    accessTokenTtlSeconds,
    refreshTokenTtlMs,
    accessCookieName: 'access_token',
    refreshCookieName: 'refresh_token',
    // Secure cookies only over HTTPS — local http://localhost must stay false
    cookieSecure: nodeEnv === 'production',
};

export type Config = typeof config;
