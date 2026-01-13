"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserActive = exports.requireAuth = exports.requireAdmin = exports.authenticate = void 0;
const jwt_js_1 = require("../utils/jwt.js");
const userRepository_js_1 = require("../repositories/userRepository.js");
const errorTypes_js_1 = require("../ errors/errorTypes.js");
/**
 * Middleware to verify JWT access token
 * 🆕 تم تحديثه لاستخدام getUserStatus بدلاً من findByIdWithPassword
 */
const authenticate = async (req, res, next) => {
    try {
        // 1. استخراج التوكن من Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorTypes_js_1.AuthenticationError('Authentication token is required');
        }
        // 2. تحليل التوكن من صيغة "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errorTypes_js_1.AuthenticationError('Invalid token format');
        }
        // 3. التحقق من صحة التوكن وفك التشفير
        const decoded = (0, jwt_js_1.verifyAccessToken)(token);
        // 🆕 4. التحقق من حالة المستخدم فقط (active) - باستخدام الدالة الجديدة
        // هذا أسرع لأننا نطلب حقل واحد فقط من قاعدة البيانات
        const userStatus = await userRepository_js_1.userRepository.getUserStatus(decoded.userId);
        if (!userStatus) {
            throw new errorTypes_js_1.AuthenticationError('User not found or account deleted');
        }
        // 🆕 5. التحقق من أن المستخدم نشط (غير معطل)
        if (!userStatus.active) {
            throw new errorTypes_js_1.AuthenticationError('Your account has been blocked. Please contact the administrator.');
        }
        // 6. إضافة بيانات المستخدم من التوكن (البيانات موجودة في التوكن أصلاً)
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name
        };
        next();
    }
    catch (error) {
        // 🆕 تحسين رسائل الخطأ
        if (error instanceof errorTypes_js_1.AuthenticationError) {
            next(error);
        }
        else if (error.name === 'TokenExpiredError') {
            next(new errorTypes_js_1.AuthenticationError('Token has expired'));
        }
        else if (error.name === 'JsonWebTokenError') {
            next(new errorTypes_js_1.AuthenticationError('Invalid token'));
        }
        else {
            console.error('Authentication middleware error:', error);
            next(new errorTypes_js_1.AuthenticationError('Authentication failed'));
        }
    }
};
exports.authenticate = authenticate;
/**
 * Middleware to enforce admin role access
 */
const requireAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorTypes_js_1.AuthenticationError('Authentication required');
        }
        if (req.user.role !== 'admin') {
            throw new errorTypes_js_1.AuthorizationError('Admin access required');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware to enforce any authenticated user access
 */
const requireAuth = (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorTypes_js_1.AuthenticationError('Authentication required');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAuth = requireAuth;
/**
 * 🆕 middleware إضافي للتحقق من حالة المستخدم فقط
 * يمكن استخدامه في routes لا تحتاج إلى توكن ولكن تحتاج إلى تحقق الحالة
 */
const checkUserActive = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorTypes_js_1.AuthenticationError('User not authenticated');
        }
        // التحقق من حالة المستخدم من قاعدة البيانات باستخدام الدالة الجديدة
        const userStatus = await userRepository_js_1.userRepository.getUserStatus(req.user.id);
        if (!userStatus) {
            throw new errorTypes_js_1.AuthenticationError('User not found');
        }
        if (!userStatus.active) {
            throw new errorTypes_js_1.AuthenticationError('Your account has been blocked');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkUserActive = checkUserActive;
