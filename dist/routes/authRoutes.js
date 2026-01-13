"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
const validate_js_2 = require("../middleware/validate.js");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/register
 * @desc    تسجيل مستخدم جديد
 * @access  Public
 */
router.post('/register', (0, validate_js_1.validateRequest)(validate_js_2.authSchemas.register), authController_js_1.register);
/**
 * @route   POST /api/auth/login
 * @desc    تسجيل دخول
 * @access  Public
 */
router.post('/login', (0, validate_js_1.validateRequest)(validate_js_2.authSchemas.login), authController_js_1.login);
/**
 * @route   POST /api/auth/refresh-token
 * @desc    تجديد التوكن
 * @access  Public
 */
router.post('/refresh-token', authController_js_1.refreshToken);
/**
 * @route   GET /api/auth/profile
 * @desc    الحصول على بيانات المستخدم
 * @access  Private (يحتاج توكن)
 */
router.get('/profile', auth_js_1.authenticate, authController_js_1.getProfile);
/**
 * @route   POST /api/auth/logout
 * @desc    تسجيل خروج
 * @access  Private (يحتاج توكن)
 */
router.post('/logout', auth_js_1.authenticate, authController_js_1.logout);
exports.default = router;
