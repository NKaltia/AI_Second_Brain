import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

export const register = async (req: any, res: any) => {
    try {
        const newUser = await authService.register(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: any, res: any) => {
    try {
        const data = await authService.login(req.body);
        res.json(data);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};
