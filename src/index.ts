import 'dotenv/config';
import { NoteService } from './services/note.service.js';
import { AIService } from './services/ai.service.js';
import { AuthService } from './services/auth.service.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));

const noteService = new NoteService();
const aiService = new AIService();
const authService = new AuthService();


app.post('/auth/register', async (req, res) => {
    try {
        const newUser = await authService.register(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const data = await authService.login(req.body);
        res.json(data);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

app.get('/notes', authMiddleware, async (req: any, res) => {

    try {
        const allNotes = await noteService.getAllNotes(req.user.userId);
        res.json(allNotes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/notes', authMiddleware, async (req: any, res) => {
    try {
        const { content, title, tags } = req.body;

        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }

        const finalTitle = title || (content.split('\n'))[0].trim().substring(0, 30);
        const finalTags = tags || [];

        const newNote = await noteService.addNote(finalTitle, content, finalTags, req.user.userId);
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

app.post('/ask', authMiddleware, async (req: any, res) => {
    try {
        const question = req.body.question;
        const history = req.body.history || [];
        if (!question) {
            res.status(400).json({ error: 'Question is required' });
            return;
        }

        const expandedSearchQuery = await aiService.expandSearchQuery(question);
        console.log(`Original: "${question}" -> Expanded: "${expandedSearchQuery}"`);

        const relevantNotes = await noteService.searchSimilarNotes(expandedSearchQuery, req.user.userId);

        const contextTexts = relevantNotes.map(note => `Title: ${note.title}\nContent: ${note.content}`);
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
});

app.put('/notes/:id', authMiddleware, async (req: any, res) => {
    try {
        const id = req.params.id;
        const content = req.body.content;
        const title = req.body.title;
        const tags = req.body.tags || [];
        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        const updatedNote = await noteService.updateNote(id, title, content, tags, req.user.userId);
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/notes/:id', authMiddleware, async (req: any, res) => {
    try {
        const id = req.params.id;
        await noteService.deleteNote(id, req.user.userId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
