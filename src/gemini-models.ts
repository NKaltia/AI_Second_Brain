/**
 * Single place for Gemini model IDs.
 * Chat: stable GA (preview IDs get shut down — see Google deprecations page).
 * Embeddings: keep gemini-embedding-001; a new embedding model = incompatible vector space
 * and a full re-embed of all notes (see docs/adr/001-gemini-models.md).
 */
export const GEMINI_CHAT_MODEL = 'gemini-3.5-flash-lite';
export const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';
export const GEMINI_EMBEDDING_DIMENSIONS = 768;
