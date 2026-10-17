/**
 * Expected failures we are willing to show to the client (wrong password, not found, …).
 * Unexpected bugs stay as plain Error → 500 + generic message in the error middleware.
 */
export class AppError extends Error {
    readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
    }
}
