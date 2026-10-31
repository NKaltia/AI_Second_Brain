import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { UserRequest } from '../interfaces/express.interface.js';

/**
 * In-memory counters (fine for a single Render instance).
 * Multiple instances behind a load balancer would need a shared store (e.g. Redis).
 */

/** Login/register — slow down password guessing (keyed by IP). */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts. Please try again later.' },
});

/**
 * /ask — protect Gemini quota (keyed by user after JWT).
 * Aligns roughly with free-tier RPM mentioned in the welcome note (~15/min).
 */
export const askRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many AI requests. Please wait a minute and try again.' },
    keyGenerator: (req) => {
        const userReq = req as UserRequest;
        // Prefer userId so shared NAT IPs don't share one AI budget
        if (userReq.user?.userId) return userReq.user.userId;
        return ipKeyGenerator(req.ip ?? 'anonymous');
    },
});
