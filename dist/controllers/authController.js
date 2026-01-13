"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getProfile = exports.refreshToken = exports.login = exports.register = void 0;
const authService_js_1 = require("../services/authService.js");
const errorTypes_js_1 = require("../ errors/errorTypes.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
/**
 * Register a new user
 */
exports.register = (0, errorTypes_js_1.catchAsync)(async (req, res, next) => {
    const { name, email, password } = req.body;
    const result = await authService_js_1.AuthService.register({ name, email, password });
    // ✅ Instead of: res.status(201).json({...})
    return responseHelper_js_1.ResponseHelper.created(res, 'User registered successfully', result);
});
/**
 * User login
 */
exports.login = (0, errorTypes_js_1.catchAsync)(async (req, res, next) => {
    const { email, password } = req.body;
    const result = await authService_js_1.AuthService.login({ email, password });
    // ✅ Instead of: res.json({...})
    return responseHelper_js_1.ResponseHelper.success(res, 'Login successful', result);
});
/**
 * Refresh token
 */
exports.refreshToken = (0, errorTypes_js_1.catchAsync)(async (req, res, next) => {
    const { refreshToken } = req.body;
    const result = await authService_js_1.AuthService.refreshToken(refreshToken);
    // ✅ Instead of: res.json({...})
    return responseHelper_js_1.ResponseHelper.success(res, 'Tokens refreshed successfully', result);
});
/**
 * Get user profile
 */
exports.getProfile = (0, errorTypes_js_1.catchAsync)(async (req, res, next) => {
    const userProfile = await authService_js_1.AuthService.getProfile(req.user.id);
    // ✅ Instead of: res.json({...})
    return responseHelper_js_1.ResponseHelper.success(res, 'Profile retrieved successfully', {
        user: userProfile
    });
});
/**
 * User logout
 */
exports.logout = (0, errorTypes_js_1.catchAsync)(async (req, res, next) => {
    // ✅ Instead of: res.json({...})
    return responseHelper_js_1.ResponseHelper.successMessage(res, 'Logout successful');
});
