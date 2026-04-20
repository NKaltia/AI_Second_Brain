import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as authController from '../controllers/auth.controller.js';
import * as noteController from '../controllers/note.controller.js';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

// Auth routes (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Note routes (protected)
router.get('/notes', authMiddleware, noteController.getAllNotes);
router.post('/notes', authMiddleware, noteController.createNote);
router.put('/notes/:id', authMiddleware, noteController.updateNote);
router.delete('/notes/:id', authMiddleware, noteController.deleteNote);

// AI route (protected)
router.post('/ask', authMiddleware, aiController.askQuestion);

export default router;
