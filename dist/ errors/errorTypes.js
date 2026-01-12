// src/errors/errorTypes.ts 
import { AppError } from './AppError.js';
/**
 * خطأ في التحقق من البيانات
 */
export class ValidationError extends AppError {
    constructor(message = 'Validation failed', details) {
        super(message, 400, true, 'VALIDATION_ERROR', details);
    }
}
/**
 * خطأ في المصادقة
 */
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, true, 'AUTHENTICATION_ERROR');
    }
}
/**
 * خطأ في الصلاحيات
 */
export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, true, 'AUTHORIZATION_ERROR');
    }
}
/**
 * خطأ في المورد
 */
export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, true, 'NOT_FOUND');
    }
}
/**
 * خطأ في تعارض البيانات
 */
export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, true, 'CONFLICT_ERROR');
    }
}
/**
 * خطأ في الخادم الداخلي
 */
export class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, false, 'INTERNAL_ERROR');
    }
}
/**
 * خطأ في قاعدة البيانات
 */
export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, true, 'DATABASE_ERROR');
    }
}
// 🔧 أضف هذا الجزء في النهاية:
/**
 * wrapper للدوال async - يلتقط الأخطاء تلقائياً
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
