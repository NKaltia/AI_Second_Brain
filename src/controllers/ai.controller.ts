import { AIService } from '../services/ai.service.js';
import { NoteService } from '../services/note.service.js';
import type { UserRequest } from '../interfaces/express.interface.js';
import type { Response } from 'express';
import type { Note } from '../interfaces/note.interface.js';
import { askBodySchema } from '../validation/schemas.js';
import { parseBody } from '../validation/parse.js';

const aiService = new AIService();
const noteService = new NoteService();

export const askQuestion = async (req: UserRequest, res: Response) => {
    const { question, history } = parseBody(askBodySchema, req.body);

    const intentAnalysis = await aiService.analyzeIntentAndExpand(question);
    console.log(`Intent Analysis for "${question}":`, intentAnalysis);

    let relevantNotes: Note[] = [];

    if (intentAnalysis.requiresSearch && intentAnalysis.expandedQuery && intentAnalysis.expandedQuery.trim().length > 0) {
        relevantNotes = await noteService.searchSimilarNotes(intentAnalysis.expandedQuery, req.user!.userId);
    }

    const contextTexts = relevantNotes.map((note) => `Title: ${note.title}\nContent: ${note.content}`);
    const aiResponse = await aiService.generateAnswer(question, contextTexts, history);

    if (aiResponse.newNoteData) {
        const { title, content, tags } = aiResponse.newNoteData;
        await noteService.addNote(title, content, tags, req.user!.userId);
        console.log('Note saved:', title);
    }

    res.json({
        answer: aiResponse.text,
        sources: relevantNotes,
        newNoteSaved: !!aiResponse.newNoteData
    });
};
