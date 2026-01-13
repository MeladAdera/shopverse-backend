"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const adminService_js_1 = require("../services/adminService.js");
const errorTypes_js_1 = require("../ errors/errorTypes.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
const AppError_js_1 = require("../ errors/AppError.js");
exports.adminController = {
    // 🎯 Get all users
    getUsers: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await adminService_js_1.adminService.getUsers(page, limit);
        responseHelper_js_1.ResponseHelper.success(res, 'Users retrieved successfully', result.data);
    }),
    // 🎯 Get specific user
    getUserById: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = parseInt(req.params.id);
        const result = await adminService_js_1.adminService.getUserById(userId);
        responseHelper_js_1.ResponseHelper.success(res, 'User data retrieved successfully', result.data);
    }),
    // 🎯 Update user status
    updateUserStatus: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = parseInt(req.params.id);
        const { active } = req.body;
        if (typeof active !== 'boolean') {
            throw new AppError_js_1.AppError('User status must be true or false', 400);
        }
        // 🆕 إرسال ID المسؤول الحالي للتحقق
        const currentAdminId = req.user?.id; // نأخذ ID المسؤول من التوكن
        const result = await adminService_js_1.adminService.updateUserStatus(userId, active, currentAdminId);
        responseHelper_js_1.ResponseHelper.success(res, result.message);
    }),
    getDashboardStats: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const stats = await adminService_js_1.adminService.getDashboardStats();
        responseHelper_js_1.ResponseHelper.success(res, 'Dashboard statistics retrieved successfully', stats.data);
    }),
    // 🆕 Get all orders
    getOrders: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const result = await adminService_js_1.adminService.getOrders(page, limit, status);
        responseHelper_js_1.ResponseHelper.success(res, 'Orders retrieved successfully', result.data);
    }),
    // Get specific order
    getOrderById: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const orderId = parseInt(req.params.id);
        const result = await adminService_js_1.adminService.getOrderById(orderId);
        responseHelper_js_1.ResponseHelper.success(res, 'Order details retrieved successfully', result.data);
    }),
    // 🆕 Update order status
    updateOrderStatus: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        const result = await adminService_js_1.adminService.updateOrderStatus(orderId, status);
        responseHelper_js_1.ResponseHelper.success(res, result.message);
    }),
    // 🆕 Get all categories
    getCategories: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await adminService_js_1.adminService.getCategories(page, limit);
        responseHelper_js_1.ResponseHelper.success(res, 'Categories retrieved successfully', result.data);
    }),
    // 🆕 Create new category
    createCategory: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const { name, image_url } = req.body;
        const result = await adminService_js_1.adminService.createCategory({ name, image_url });
        responseHelper_js_1.ResponseHelper.success(res, result.message, result.data, 201);
    }),
    // 🆕 Update category
    updateCategory: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const categoryId = parseInt(req.params.id);
        const updateData = req.body;
        const result = await adminService_js_1.adminService.updateCategory(categoryId, updateData);
        responseHelper_js_1.ResponseHelper.success(res, result.message, result.data);
    }),
    // 🆕 Delete category
    deleteCategory: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const categoryId = parseInt(req.params.id);
        const result = await adminService_js_1.adminService.deleteCategory(categoryId);
        responseHelper_js_1.ResponseHelper.success(res, result.message);
    }),
};
