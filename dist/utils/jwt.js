"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
// src/utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
/**
 * إنشاء Access Token (صالح لمدة قصيرة)
 */
const generateAccessToken = (payload) => {
    if (!env_js_1.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_SECRET, {
        expiresIn: '15m', // 15 دقيقة - يمكن تعديلها
        issuer: 'shopverse-api',
        audience: 'shopverse-users',
    });
};
exports.generateAccessToken = generateAccessToken;
/**
 * إنشاء Refresh Token (صالح لمدة طويلة)
 */
const generateRefreshToken = (payload) => {
    if (!env_js_1.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d', // 7 أيام
        issuer: 'shopverse-api',
        audience: 'shopverse-users',
    });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * التحقق من Access Token
 */
const verifyAccessToken = (token) => {
    if (!env_js_1.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * التحقق من Refresh Token
 */
const verifyRefreshToken = (token) => {
    if (!env_js_1.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * استخراج البيانات من التوكن بدون التحقق (للاستخدام الداخلي فقط)
 */
const decodeToken = (token) => {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch {
        return null;
    }
};
exports.decodeToken = decodeToken;
