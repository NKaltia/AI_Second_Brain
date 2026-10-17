import { NoteService } from '../services/note.service.js';
import type { UserRequest } from '../interfaces/express.interface.js';
import type { Response } from 'express';
import { AppError } from '../utils/errors.js';

const noteService = new NoteService();

export const getAllNotes = async (req: UserRequest, res: Response) => {
    const allNotes = await noteService.getAllNotes(req.user!.userId);
    res.json(allNotes);
};

export const createNote = async (req: UserRequest, res: Response) => {
    const { content, title, tags } = req.body;

    if (!content) {
        throw new AppError(400, 'Content is required');
    }

    const finalTitle = title || (content.split('\n'))[0].trim().substring(0, 30);
    const finalTags = tags || [];

    const newNote = await noteService.addNote(finalTitle, content, finalTags, req.user!.userId);
    res.status(201).json(newNote);
};

export const updateNote = async (req: UserRequest, res: Response) => {
    const id = req.params.id as string;
    const content = req.body.content;
    const title = req.body.title;
    const tags = req.body.tags || [];

    if (!content) {
        throw new AppError(400, 'Content is required');
    }

    const updatedNote = await noteService.updateNote(id, title, content, tags, req.user!.userId);
    res.status(200).json(updatedNote);
};

export const deleteNote = async (req: UserRequest, res: Response) => {
    const id = req.params.id as string;
    await noteService.deleteNote(id, req.user!.userId);
    res.status(204).send();
};
