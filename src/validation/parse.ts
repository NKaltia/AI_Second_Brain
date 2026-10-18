import type { z } from 'zod';
import { AppError } from '../utils/errors.js';

/**
 * Parse unknown input with a Zod schema.
 * On failure → AppError 400 with safe field messages (no raw dump of the body).
 */
export function parseBody<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
    const result = schema.safeParse(data);

    if (!result.success) {
        const message = result.error.issues
            .map((issue) => {
                const field = issue.path.length > 0 ? String(issue.path[0]) : 'body';
                return `${field}: ${issue.message}`;
            })
            .join('; ');

        throw new AppError(400, message);
    }

    return result.data;
}
