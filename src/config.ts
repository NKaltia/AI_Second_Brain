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

export const config = {
    databaseUrl: parsed.data.DATABASE_URL,
    geminiApiKey: parsed.data.GEMINI_API_KEY,
    jwtSecret: parsed.data.JWT_SECRET,
    port: parsed.data.PORT,
    nodeEnv: parsed.data.NODE_ENV,
};

export type Config = typeof config;
