import type { Response } from 'express';
import { config } from '../config.js';

const baseCookieOptions = {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax' as const,
    path: '/',
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie(config.accessCookieName, accessToken, {
        ...baseCookieOptions,
        maxAge: config.accessTokenTtlSeconds * 1000,
    });
    res.cookie(config.refreshCookieName, refreshToken, {
        ...baseCookieOptions,
        maxAge: config.refreshTokenTtlMs,
    });
}

export function clearAuthCookies(res: Response): void {
    res.clearCookie(config.accessCookieName, {
        ...baseCookieOptions,
    });
    res.clearCookie(config.refreshCookieName, {
        ...baseCookieOptions,
    });
}

/** Short-lived CSRF marker for the Google OAuth round-trip. */
export function setOAuthStateCookie(res: Response, state: string): void {
    res.cookie(config.oauthStateCookieName, state, {
        ...baseCookieOptions,
        maxAge: 10 * 60 * 1000,
    });
}

export function clearOAuthStateCookie(res: Response): void {
    res.clearCookie(config.oauthStateCookieName, {
        ...baseCookieOptions,
    });
}
