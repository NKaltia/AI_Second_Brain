import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { askRateLimiter, authRateLimiter } from '../middleware/rateLimit.middleware.js';
import * as authController from '../controllers/auth.controller.js';
import * as noteController from '../controllers/note.controller.js';
import * as aiController from '../controllers/ai.controller.js';
import * as healthController from '../controllers/health.controller.js';

const router = Router();

// Auth routes — rate limit before bcrypt / DB / refresh rotation
router.get('/health', healthController.healthCheck);
router.post('/auth/register', authRateLimiter, authController.register);
router.post('/auth/login', authRateLimiter, authController.login);
router.post('/auth/refresh', authRateLimiter, authController.refresh);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authMiddleware, authController.me);

// Note routes (protected)
router.get('/notes', authMiddleware, noteController.getAllNotes);
router.post('/notes', authMiddleware, noteController.createNote);
router.put('/notes/:id', authMiddleware, noteController.updateNote);
router.delete('/notes/:id', authMiddleware, noteController.deleteNote);

// AI route (protected) — auth first, then per-user quota before Gemini
router.post('/ask', authMiddleware, askRateLimiter, aiController.askQuestion);

export default router;
