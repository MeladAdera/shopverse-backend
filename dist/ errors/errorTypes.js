"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.DatabaseError = exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = void 0;
// src/errors/errorTypes.ts 
const AppError_js_1 = require("./AppError.js");
/**
 * خطأ في التحقق من البيانات
 */
class ValidationError extends AppError_js_1.AppError {
    constructor(message = 'Validation failed', details) {
        super(message, 400, true, 'VALIDATION_ERROR', details);
    }
}
exports.ValidationError = ValidationError;
/**
 * خطأ في المصادقة
 */
class AuthenticationError extends AppError_js_1.AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, true, 'AUTHENTICATION_ERROR');
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * خطأ في الصلاحيات
 */
class AuthorizationError extends AppError_js_1.AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, true, 'AUTHORIZATION_ERROR');
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * خطأ في المورد
 */
class NotFoundError extends AppError_js_1.AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, true, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
/**
 * خطأ في تعارض البيانات
 */
class ConflictError extends AppError_js_1.AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, true, 'CONFLICT_ERROR');
    }
}
exports.ConflictError = ConflictError;
/**
 * خطأ في الخادم الداخلي
 */
class InternalServerError extends AppError_js_1.AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, false, 'INTERNAL_ERROR');
    }
}
exports.InternalServerError = InternalServerError;
/**
 * خطأ في قاعدة البيانات
 */
class DatabaseError extends AppError_js_1.AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, true, 'DATABASE_ERROR');
    }
}
exports.DatabaseError = DatabaseError;
// 🔧 أضف هذا الجزء في النهاية:
/**
 * wrapper للدوال async - يلتقط الأخطاء تلقائياً
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.catchAsync = catchAsync;
