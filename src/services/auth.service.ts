import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import type { AuthBody } from '../validation/schemas.js';
import { NoteService } from './note.service.js';
import { WELCOME_NOTE_TITLE, WELCOME_NOTE_CONTENT, WELCOME_NOTE_TAGS } from '../utils/templates.js';
import { config } from '../config.js';
import { AppError } from '../utils/errors.js';
import { generateRefreshToken, hashToken } from '../utils/tokens.js';

export type SessionUser = { id: string; email: string };

export type IssuedSession = {
    user: SessionUser;
    accessToken: string;
    refreshToken: string;
};

// Precomputed once so "user missing" and "wrong password" both pay ~same bcrypt cost (timing).
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(`timing-dummy-${randomBytes(16).toString('hex')}`, 10);

export class AuthService {
    private noteService = new NoteService();

    async register(data: AuthBody): Promise<IssuedSession> {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        let user;
        try {
            user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                },
            });
        } catch (error: unknown) {
            // Prisma unique violation on email — do not leak the raw DB message to the client
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error as { code: string }).code === 'P2002'
            ) {
                throw new AppError(409, 'Email already registered');
            }
            throw error;
        }

        await this.noteService.addNote(
            WELCOME_NOTE_TITLE,
            WELCOME_NOTE_CONTENT,
            WELCOME_NOTE_TAGS,
            user.id
        );

        return this.issueSession(user.id, user.email);
    }

    async login(data: AuthBody): Promise<IssuedSession> {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
        const isPasswordValid = await bcrypt.compare(data.password, passwordHash);

        // Same message for unknown email and wrong password — prevents user enumeration
        if (!user || !isPasswordValid) {
            throw new AppError(401, 'Invalid email or password');
        }

        return this.issueSession(user.id, user.email);
    }

    /**
     * Rotate refresh: old raw token → hash → DB row.
     * Already-revoked row presented again = suspected theft → revoke all sessions for that user.
     */
    async refresh(rawRefreshToken: string | undefined): Promise<IssuedSession> {
        if (!rawRefreshToken) {
            throw new AppError(401, 'Unauthorized');
        }

        const tokenHash = hashToken(rawRefreshToken);
        const existing = await prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: { select: { id: true, email: true } } },
        });

        if (!existing) {
            throw new AppError(401, 'Unauthorized');
        }

        if (existing.revokedAt) {
            await prisma.refreshToken.updateMany({
                where: { userId: existing.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            throw new AppError(401, 'Unauthorized');
        }

        if (existing.expiresAt.getTime() <= Date.now()) {
            await prisma.refreshToken.update({
                where: { id: existing.id },
                data: { revokedAt: new Date() },
            });
            throw new AppError(401, 'Unauthorized');
        }

        await prisma.refreshToken.update({
            where: { id: existing.id },
            data: { revokedAt: new Date() },
        });

        return this.issueSession(existing.user.id, existing.user.email);
    }

    /** Revoke this refresh session if the cookie is present. Missing/unknown token is still OK (idempotent logout). */
    async logout(rawRefreshToken: string | undefined): Promise<void> {
        if (!rawRefreshToken) {
            return;
        }

        const tokenHash = hashToken(rawRefreshToken);
        await prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    private async issueSession(userId: string, email: string): Promise<IssuedSession> {
        const accessToken = jwt.sign(
            { userId, email },
            config.jwtSecret,
            {
                expiresIn: config.accessTokenTtlSeconds,
                algorithm: 'HS256',
            }
        );

        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + config.refreshTokenTtlMs);

        await prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: hashToken(refreshToken),
                expiresAt,
            },
        });

        return {
            user: { id: userId, email },
            accessToken,
            refreshToken,
        };
    }
}
