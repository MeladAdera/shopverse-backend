"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordStrength = exports.verifyPassword = exports.hashPassword = void 0;
// src/utils/password.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * تشفير كلمة المرور
 */
const hashPassword = async (password) => {
    const saltRounds = 12; // عدد مرات التشفير (أعلى = أكثر أماناً ولكن أبطئ)
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
/**
 * التحقق من كلمة المرور
 */
const verifyPassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.verifyPassword = verifyPassword;
/**
 * التحقق من قوة كلمة المرور
 */
const validatePasswordStrength = (password) => {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
};
exports.validatePasswordStrength = validatePasswordStrength;
