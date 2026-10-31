import type { Logger } from 'pino';
import type { Note } from '../interfaces/note.interface.js';
import { logger as rootLogger } from '../logger.js';
import { AIService } from './ai.service.js';
import { NoteService } from './note.service.js';

export type AskInput = {
    userId: string;
    question: string;
    history: { role: string; content: string }[];
    /** Prefer req.log so lines share the request id from pino-http */
    log?: Logger;
    requestId?: string;
};

export type AskResult = {
    answer: string;
    sources: Note[];
    newNoteSaved: boolean;
    /** Intent/search path failed or was skipped after a failure — answer may lack note context */
    notesSearchSkipped: boolean;
    /** Short human-facing explanation when notesSearchSkipped */
    notice?: string;
};

const NOTES_SEARCH_NOTICE =
    "I couldn't search your notes this time, so this answer isn't based on them.";

/**
 * Use-case / application service for POST /ask.
 * Owns the multi-step workflow; has no req/res — safe to call from HTTP, a bot, or CLI.
 */
export class AskService {
    private aiService = new AIService();
    private noteService = new NoteService();

    async ask(input: AskInput): Promise<AskResult> {
        const log = input.log ?? rootLogger;
        const requestId = input.requestId;

        let notesSearchSkipped = false;
        let relevantNotes: Note[] = [];

        try {
            const intent = await this.aiService.analyzeIntentAndExpand(input.question);
            log.debug({ requestId, intent }, 'intent analysis');

            if (intent.requiresSearch && intent.expandedQuery.trim().length > 0) {
                relevantNotes = await this.noteService.searchSimilarNotes(
                    intent.expandedQuery,
                    input.userId
                );
            }
        } catch (err) {
            // Graceful degradation: still answer without RAG; do not fail the whole /ask
            notesSearchSkipped = true;
            log.warn({ err, requestId }, 'intent or note search failed; answering without note context');
        }

        const contextTexts = relevantNotes.map(
            (note) => `Title: ${note.title}\nContent: ${note.content}`
        );
        const aiResponse = await this.aiService.generateAnswer(
            input.question,
            contextTexts,
            input.history,
            log
        );

        let newNoteSaved = false;
        if (aiResponse.newNoteData) {
            const { title, content, tags } = aiResponse.newNoteData;
            await this.noteService.addNote(title, content, tags, input.userId);
            newNoteSaved = true;
            log.info({ requestId, title }, 'note saved from tool call');
        }

        return {
            answer: aiResponse.text,
            sources: relevantNotes,
            newNoteSaved,
            notesSearchSkipped,
            notice: notesSearchSkipped ? NOTES_SEARCH_NOTICE : undefined,
        };
    }
}
