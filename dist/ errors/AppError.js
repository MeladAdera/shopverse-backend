/**
 * Base application error class - parent of all custom errors
 */
export class AppError extends Error {
    statusCode;
    isOperational;
    code;
    details;
    constructor(message, statusCode = 500, isOperational = true, code, details) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;
        // حل مشكلة captureStackTrace
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            // Fallback إذا ما كانت متوفرة
            this.stack = new Error().stack;
        }
    }
}
