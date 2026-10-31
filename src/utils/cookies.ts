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
