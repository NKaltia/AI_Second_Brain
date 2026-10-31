import { randomBytes } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config.js';
import { AppError } from '../utils/errors.js';
import { AuthService, type IssuedSession } from './auth.service.js';

const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

function requireGoogleConfig(): { clientId: string; clientSecret: string } {
    if (!config.googleClientId || !config.googleClientSecret) {
        throw new AppError(503, 'Google sign-in is not configured');
    }
    return { clientId: config.googleClientId, clientSecret: config.googleClientSecret };
}

function createOAuthClient(): OAuth2Client {
    const { clientId, clientSecret } = requireGoogleConfig();
    return new OAuth2Client(
        clientId,
        clientSecret,
        `${config.appBaseUrl}/auth/google/callback`
    );
}

export class OAuthService {
    private authService = new AuthService();

    /** Random `state` for the CSRF cookie + Google authorize URL. */
    startGoogleLogin(): { state: string; authorizationUrl: string } {
        const client = createOAuthClient();
        const state = randomBytes(24).toString('base64url');
        const authorizationUrl = client.generateAuthUrl({
            access_type: 'online',
            scope: GOOGLE_SCOPES,
            state,
            prompt: 'select_account',
        });
        return { state, authorizationUrl };
    }

    /**
     * Exchange `code`, verify ID token, find/create user, issue our session cookies payload.
     * `state` from query must match the value we stored in the oauth_state cookie.
     */
    async finishGoogleLogin(params: {
        code: string | undefined;
        state: string | undefined;
        expectedState: string | undefined;
    }): Promise<IssuedSession> {
        requireGoogleConfig();

        if (!params.code || !params.state || !params.expectedState) {
            throw new AppError(400, 'Invalid OAuth callback');
        }
        if (params.state !== params.expectedState) {
            throw new AppError(400, 'Invalid OAuth state');
        }

        const client = createOAuthClient();
        const { tokens } = await client.getToken(params.code);
        if (!tokens.id_token) {
            throw new AppError(401, 'Google did not return an ID token');
        }

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.googleClientId,
        });
        const payload = ticket.getPayload();
        if (!payload?.sub || !payload.email || payload.email_verified !== true) {
            throw new AppError(401, 'Google account email is not verified');
        }

        return this.authService.loginWithGoogle({
            googleId: payload.sub,
            email: payload.email,
        });
    }
}
