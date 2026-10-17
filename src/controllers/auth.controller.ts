import { AuthService } from '../services/auth.service.js';
import type { Request, Response } from 'express';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    const newUser = await authService.register(req.body);
    res.status(201).json(newUser);
};

export const login = async (req: Request, res: Response) => {
    const data = await authService.login(req.body);
    res.json(data);
};
