import type { Request, Response, NextFunction } from 'express';
import { OAuthService } from '../services/oauth.service.js';
import { setAuthCookies, setOAuthStateCookie, clearOAuthStateCookie } from '../utils/cookies.js';
import { config } from '../config.js';
import { AppError } from '../utils/errors.js';

const oauthService = new OAuthService();

function stateFromRequest(req: Request): string | undefined {
    const value = req.cookies?.[config.oauthStateCookieName];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** Step 2 in the story: send the browser to Google. */
export const googleStart = async (_req: Request, res: Response) => {
    const { state, authorizationUrl } = oauthService.startGoogleLogin();
    setOAuthStateCookie(res, state);
    res.redirect(authorizationUrl);
};

/** Step 4–8: Google comes back with a one-time code → our session cookies → home. */
export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = typeof req.query.code === 'string' ? req.query.code : undefined;
        const state = typeof req.query.state === 'string' ? req.query.state : undefined;

        const session = await oauthService.finishGoogleLogin({
            code,
            state,
            expectedState: stateFromRequest(req),
        });

        clearOAuthStateCookie(res);
        setAuthCookies(res, session.accessToken, session.refreshToken);
        res.redirect('/');
    } catch (err) {
        clearOAuthStateCookie(res);
        if (err instanceof AppError && err.statusCode < 500) {
            res.redirect('/?oauth=error');
            return;
        }
        next(err);
    }
};
