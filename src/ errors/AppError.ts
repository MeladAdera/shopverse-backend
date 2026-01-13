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
        
        // الحل السهل: تجاهل captureStackTrace تماماً
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;
    }
}