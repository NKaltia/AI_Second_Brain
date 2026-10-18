import { AuthService } from '../services/auth.service.js';
import type { Request, Response } from 'express';
import { authBodySchema } from '../validation/schemas.js';
import { parseBody } from '../validation/parse.js';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    const body = parseBody(authBodySchema, req.body);
    const newUser = await authService.register(body);
    res.status(201).json(newUser);
};

export const login = async (req: Request, res: Response) => {
    const body = parseBody(authBodySchema, req.body);
    const data = await authService.login(body);
    res.json(data);
};
