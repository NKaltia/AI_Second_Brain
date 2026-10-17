import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthDto } from '../interfaces/auth.interface.js';
import { NoteService } from './note.service.js';
import { WELCOME_NOTE_TITLE, WELCOME_NOTE_CONTENT, WELCOME_NOTE_TAGS } from '../utils/templates.js';
import { config } from '../config.js';
import { AppError } from '../utils/errors.js';

export class AuthService {
    private noteService = new NoteService();

    async register(data: AuthDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        let user;
        try {
            user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword
                }
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

        // Generate the default onboarding note from our templates
        await this.noteService.addNote(
            WELCOME_NOTE_TITLE,
            WELCOME_NOTE_CONTENT,
            WELCOME_NOTE_TAGS,
            user.id
        );

        return { id: user.id, email: user.email };
    }

    async login(data: AuthDto) {
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        // Same message for unknown email and wrong password — prevents user enumeration
        if (!user) {
            throw new AppError(401, 'Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid email or password');
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: '24h' });
        return { token, user: { id: user.id, email: user.email } };
    }
}