import { createHash, randomBytes } from 'node:crypto';

/** Opaque refresh string for the cookie — not a JWT. */
export function generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
}

/** Store only this fingerprint in the DB; raw token never leaves the cookie. */
export function hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
}
