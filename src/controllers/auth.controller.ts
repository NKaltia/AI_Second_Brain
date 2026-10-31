import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authBodySchema } from '../validation/schemas.js';
import { parseBody } from '../validation/parse.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';
import { config } from '../config.js';
import type { UserRequest } from '../interfaces/express.interface.js';

const authService = new AuthService();

function refreshFromRequest(req: Request): string | undefined {
    const value = req.cookies?.[config.refreshCookieName];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export const register = async (req: Request, res: Response) => {
    const body = parseBody(authBodySchema, req.body);
    const session = await authService.register(body);
    setAuthCookies(res, session.accessToken, session.refreshToken);
    res.status(201).json({ user: session.user });
};

export const login = async (req: Request, res: Response) => {
    const body = parseBody(authBodySchema, req.body);
    const session = await authService.login(body);
    setAuthCookies(res, session.accessToken, session.refreshToken);
    res.json({ user: session.user });
};

export const refresh = async (req: Request, res: Response) => {
    const session = await authService.refresh(refreshFromRequest(req));
    setAuthCookies(res, session.accessToken, session.refreshToken);
    res.json({ user: session.user });
};

export const logout = async (req: Request, res: Response) => {
    await authService.logout(refreshFromRequest(req));
    clearAuthCookies(res);
    res.status(204).send();
};

/** Page-load "am I logged in?" — JS cannot read HttpOnly cookies. */
export const me = async (req: UserRequest, res: Response) => {
    res.json({
        user: {
            id: req.user!.userId,
            email: req.user!.email,
        },
    });
};
