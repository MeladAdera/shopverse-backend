"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.notFoundHandler = exports.errorHandler = void 0;
const AppError_js_1 = require("./AppError.js");
const env_js_1 = require("../config/env.js");
const errorTypes_js_1 = require("./errorTypes.js");
/**
 * Central error handling middleware for Express applications
 */
const errorHandler = (error, req, res, next) => {
    // Convert unknown errors to AppError
    let handledError;
    if (error instanceof AppError_js_1.AppError) {
        handledError = error;
    }
    else {
        // Unexpected error - convert to InternalServerError
        handledError = new AppError_js_1.AppError(error.message || 'Something went wrong', 500, false);
    }
    // Log error with request details
    logError(handledError, req);
    // Send appropriate response based on environment
    sendErrorResponse(handledError, req, res);
};
exports.errorHandler = errorHandler;
/**
 * Log error with request context details
 */
const logError = (error, req) => {
    const logDetails = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
            code: error.code,
            stack: error.stack,
            details: error.details,
        }
    };
    if (error.statusCode >= 500) {
        // Server errors - log as error
        console.error('🚨 Server Error:', logDetails);
    }
    else {
        // Client errors - log as warning
        console.warn('⚠️ Client Error:', logDetails);
    }
};
/**
 * Send formatted error response to client
 */
const sendErrorResponse = (error, req, res) => {
    // Development environment - detailed error information
    if (env_js_1.env.NODE_ENV === 'development') {
        res.status(error.statusCode).json({
            success: false,
            error: error.message,
            code: error.code,
            stack: error.stack,
            details: error.details,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }
    else {
        // Production environment - secure error messages
        if (error.isOperational) {
            // Expected operational errors - show original message
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
                ...(error.code && { code: error.code })
            });
        }
        else {
            // Unexpected errors - generic message
            res.status(500).json({
                success: false,
                error: 'Something went wrong!'
            });
        }
    }
};
/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const error = new errorTypes_js_1.NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Wrapper to catch async errors in route handlers
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.catchAsync = catchAsync;
