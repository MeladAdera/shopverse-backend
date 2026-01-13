"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGuard = void 0;
const AppError_js_1 = require("../ errors/AppError.js");
const adminGuard = (req, res, next) => {
    // Ensure user is logged in and has Admin privileges
    if (!req.user) {
        throw new AppError_js_1.AppError('Unauthorized - Please log in', 401);
    }
    if (req.user.role !== 'admin') {
        throw new AppError_js_1.AppError('Unauthorized - Insufficient permissions', 403);
    }
    next();
};
exports.adminGuard = adminGuard;
