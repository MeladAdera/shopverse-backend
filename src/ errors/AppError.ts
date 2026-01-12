/**
 * Base application error class - parent of all custom errors
 */
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: string;
    details?: any;

    constructor(
        message: string, 
        statusCode: number = 500, 
        isOperational: boolean = true, 
        code?: string, 
        details?: any
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;

        // حل مشكلة captureStackTrace
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            // Fallback إذا ما كانت متوفرة
            this.stack = new Error().stack;
        }
    }
}