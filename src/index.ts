import 'dotenv/config';
import { NoteService } from './services/note.service.js';
import { AIService } from './services/ai.service.js';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));

const noteService = new NoteService();
const aiService = new AIService();

app.get('/notes', async (req, res) => {

    try {
        const allNotes = await noteService.getAllNotes();
        res.json(allNotes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/notes', async (req, res) => {
    try {
        const { content, title, tags } = req.body;

        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }

        const finalTitle = title || (content.split('\n'))[0].trim().substring(0, 30);
        const finalTags = tags || [];

        const newNote = await noteService.addNote(finalTitle, content, finalTags);
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

app.post('/ask', async (req, res) => {
    try {
        const question = req.body.question;
        const history = req.body.history || [];
        if (!question) {
            res.status(400).json({ error: 'Question is required' });
            return;
        }

        const expandedSearchQuery = await aiService.expandSearchQuery(question);
        console.log(`Original: "${question}" -> Expanded: "${expandedSearchQuery}"`);

        const relevantNotes = await noteService.searchSimilarNotes(expandedSearchQuery);

        const contextTexts = relevantNotes.map(note => `Title: ${note.title}\nContent: ${note.content}`);
        const aiResponse = await aiService.generateAnswer(question, contextTexts, history);

        if (aiResponse.newNoteData) {
            const { title, content, tags } = aiResponse.newNoteData;
            await noteService.addNote(title, content, tags);
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

app.put('/notes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const content = req.body.content;
        const title = req.body.title;
        const tags = req.body.tags || [];
        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        const updatedNote = await noteService.updateNote(id, title, content, tags);
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/notes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await noteService.deleteNote(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
