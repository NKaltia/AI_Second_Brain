import { NoteService } from '../services/note.service.js';
import type { UserRequest } from '../interfaces/express.interface.js';
import type { Response } from 'express';

const noteService = new NoteService();

export const getAllNotes = async (req: UserRequest, res: Response) => {
    try {
        const allNotes = await noteService.getAllNotes(req.user!.userId);
        res.json(allNotes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

export const createNote = async (req: UserRequest, res: Response) => {
    try {
        const { content, title, tags } = req.body;

        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }

        const finalTitle = title || (content.split('\n'))[0].trim().substring(0, 30);
        const finalTags = tags || [];

        const newNote = await noteService.addNote(finalTitle, content, finalTags, req.user!.userId);
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
};

export const updateNote = async (req: UserRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const content = req.body.content;
        const title = req.body.title;
        const tags = req.body.tags || [];
        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        const updatedNote = await noteService.updateNote(id, title, content, tags, req.user!.userId);
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
};

export const deleteNote = async (req: UserRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        await noteService.deleteNote(id, req.user!.userId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};
