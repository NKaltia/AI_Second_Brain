import { z } from 'zod';

export const authBodySchema = z.object({
    email: z.string().trim().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

/** JWT access payload after verify — never trust `as { userId, email }` alone */
export const accessTokenPayloadSchema = z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
});

export const createNoteBodySchema = z.object({
    content: z.string().min(1, 'Content is required'),
    title: z.string().trim().min(1).max(200).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
});

export const updateNoteBodySchema = z.object({
    content: z.string().min(1, 'Content is required'),
    title: z.string().trim().min(1).max(200).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
});

const chatMessageSchema = z.object({
    role: z.enum(['user', 'assistant', 'model']),
    content: z.string().max(10_000),
});

export const askBodySchema = z.object({
    question: z.string().trim().min(1, 'Question is required').max(4000),
    history: z.array(chatMessageSchema).max(40).optional().default([]),
});

/** LLM intent JSON — same trust boundary idea as req.body */
export const intentResultSchema = z.object({
    requiresSearch: z.boolean(),
    expandedQuery: z.string().optional().default(''),
});

/** Arguments from Gemini function calling for saveNote — never trust `as any` */
export const saveNoteToolArgsSchema = z.object({
    messageToUser: z.string().trim().min(1).max(500),
    title: z.string().trim().min(1).max(200),
    content: z.string().min(1).max(50_000),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export type AuthBody = z.infer<typeof authBodySchema>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type CreateNoteBody = z.infer<typeof createNoteBodySchema>;
export type UpdateNoteBody = z.infer<typeof updateNoteBodySchema>;
export type AskBody = z.infer<typeof askBodySchema>;
export type SaveNoteToolArgs = z.infer<typeof saveNoteToolArgsSchema>;
export type IntentResult = z.infer<typeof intentResultSchema>;
