import { prisma } from '../db.js';
import type { Note } from '../interfaces/note.interface.js';
import { AIService } from './ai.service.js';

export class NoteService {
    private aiService = new AIService();

    async addNote(title: string, content: string, tags: string[], userId: string): Promise<Note> {
        const textToEmbed = `TITLE: ${title}\nTAGS: ${tags.join(', ')}\n\nCONTENT: ${content}\n\nKEYWORDS: ${title}, ${tags.join(', ')}`;
        const embeddingArray = await this.aiService.generateEmbedding(textToEmbed, 'RETRIEVAL_DOCUMENT');

        const queryVectorString = JSON.stringify(embeddingArray);

        const result = await prisma.$queryRaw<Note[]>`
            INSERT INTO "Note" (id, title, content, embedding, tags, "userId", "createdAt")
            VALUES (
                gen_random_uuid(),
                ${title},
                ${content},
                ${queryVectorString}::vector,
                ${tags},
                ${userId},
                NOW()
            )
            RETURNING id, title, content, tags, "createdAt";
       `;
        return result[0] as Note;
    }

    async getAllNotes(userId: string): Promise<Note[]> {
        const notesArray = await prisma.note.findMany({ orderBy: { createdAt: 'desc' }, where: { userId: userId } });
        return notesArray;
    }

    async deleteNote(id: string, userId: string): Promise<void> {
        await prisma.note.delete({
            where: { userId, id }
        });
    }

    async updateNote(id: string, title: string, content: string, tags: string[], userId: string): Promise<Note> {
        const textToEmbed = `TITLE: ${title}\nTAGS: ${tags.join(', ')}\n\nCONTENT: ${content}\n\nKEYWORDS: ${title}, ${tags.join(', ')}`;
        const embeddingArray = await this.aiService.generateEmbedding(textToEmbed, 'RETRIEVAL_DOCUMENT');
        const queryVectorString = JSON.stringify(embeddingArray);

        const result = await prisma.$queryRaw<Note[]>`
            UPDATE "Note"
            SET title = ${title}, content =  ${content}, embedding = ${queryVectorString}::vector, tags = ${tags}
            WHERE "userId" = ${userId} AND id = ${id}
            RETURNING id, title, content, tags, "createdAt";
        `;
        return result[0] as Note;
    }

    async searchSimilarNotes(query: string, userId: string): Promise<Note[]> {
        const embeddedQuery = await this.aiService.generateEmbedding(query, 'RETRIEVAL_QUERY');
        const queryVectorString = JSON.stringify(embeddedQuery);
        const result = await prisma.$queryRaw<Note[]>`
        SELECT id, title, content, tags, "createdAt"
        FROM "Note"
        WHERE "userId" = ${userId} AND embedding <=> ${queryVectorString}::vector < 0.4 
        ORDER BY embedding <=> ${queryVectorString}::vector
        LIMIT 5;
        `;
        return result;
    }
}