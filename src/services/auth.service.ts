import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthDto } from '../interfaces/auth.interface.js';

export class AuthService {
    private JWT_SECRET = process.env.JWT_SECRET || 'secret-key-36';

    async register(data: AuthDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword
            }
        });
        return { id: user.id, email: user.email };
    }

    async login(data: AuthDto) {
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) throw new Error('Invalid password');

        const token = jwt.sign({ userId: user.id, email: user.email }, this.JWT_SECRET, { expiresIn: '24h' });
        return { token, user: { id: user.id, email: user.email } };
    }
}