import { AuthService } from '../services/auth.service.js';
import type { Request,Response } from 'express';
import type { UserRequest } from '../interfaces/express.interface.js';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    try {
        const newUser = await authService.register(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const data = await authService.login(req.body);
        res.json(data);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};
