"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true, code, details) {
        super(message);
        // الحل السهل: تجاهل captureStackTrace تماماً
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;
    }
}
exports.AppError = AppError;
