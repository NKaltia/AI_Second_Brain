import { AIService } from '../services/ai.service.js';
import { NoteService } from '../services/note.service.js';

const aiService = new AIService();
const noteService = new NoteService();

export const askQuestion = async (req: any, res: any) => {
    try {
        const question = req.body.question;
        const history = req.body.history || [];
        if (!question) {
            res.status(400).json({ error: 'Question is required' });
            return;
        }

        const intentAnalysis = await aiService.analyzeIntentAndExpand(question);
        console.log(`Intent Analysis for "${question}":`, intentAnalysis);

        let relevantNotes: any[] = [];
        
        // Only hit the database if the AI marked requiresSearch = true AND generated an actual string
        if (intentAnalysis.requiresSearch && intentAnalysis.expandedQuery && intentAnalysis.expandedQuery.trim().length > 0) {
            relevantNotes = await noteService.searchSimilarNotes(intentAnalysis.expandedQuery, req.user.userId);
        }

        const contextTexts = relevantNotes.map((note: any) => `Title: ${note.title}\nContent: ${note.content}`);
        const aiResponse = await aiService.generateAnswer(question, contextTexts, history);

        if (aiResponse.newNoteData) {
            const { title, content, tags } = aiResponse.newNoteData;
            await noteService.addNote(title, content, tags, req.user.userId);
            console.log('Note saved:', title);
        }

        res.json({
            answer: aiResponse.text,
            sources: relevantNotes,
            newNoteSaved: !!aiResponse.newNoteData
        });
    } catch (error: any) {
        console.error('Error asking AI:', error);
        res.status(500).json({ error: 'Failed to generate answer', details: error.message, stack: error.stack });
    }
};
