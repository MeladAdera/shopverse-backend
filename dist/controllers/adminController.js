import { adminService } from '../services/adminService.js';
import { catchAsync } from '../ errors/errorTypes.js';
import { ResponseHelper } from '../utils/responseHelper.js';
import { AppError } from '../ errors/AppError.js';
export const adminController = {
    // 🎯 Get all users
    getUsers: catchAsync(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await adminService.getUsers(page, limit);
        ResponseHelper.success(res, 'Users retrieved successfully', result.data);
    }),
    // 🎯 Get specific user
    getUserById: catchAsync(async (req, res) => {
        const userId = parseInt(req.params.id);
        const result = await adminService.getUserById(userId);
        ResponseHelper.success(res, 'User data retrieved successfully', result.data);
    }),
    // 🎯 Update user status
    updateUserStatus: catchAsync(async (req, res) => {
        const userId = parseInt(req.params.id);
        const { active } = req.body;
        if (typeof active !== 'boolean') {
            throw new AppError('User status must be true or false', 400);
        }
        // 🆕 إرسال ID المسؤول الحالي للتحقق
        const currentAdminId = req.user?.id; // نأخذ ID المسؤول من التوكن
        const result = await adminService.updateUserStatus(userId, active, currentAdminId);
        ResponseHelper.success(res, result.message);
    }),
    getDashboardStats: catchAsync(async (req, res) => {
        const stats = await adminService.getDashboardStats();
        ResponseHelper.success(res, 'Dashboard statistics retrieved successfully', stats.data);
    }),
    // 🆕 Get all orders
    getOrders: catchAsync(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const result = await adminService.getOrders(page, limit, status);
        ResponseHelper.success(res, 'Orders retrieved successfully', result.data);
    }),
    // Get specific order
    getOrderById: catchAsync(async (req, res) => {
        const orderId = parseInt(req.params.id);
        const result = await adminService.getOrderById(orderId);
        ResponseHelper.success(res, 'Order details retrieved successfully', result.data);
    }),
    // 🆕 Update order status
    updateOrderStatus: catchAsync(async (req, res) => {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        const result = await adminService.updateOrderStatus(orderId, status);
        ResponseHelper.success(res, result.message);
    }),
    // 🆕 Get all categories
    getCategories: catchAsync(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await adminService.getCategories(page, limit);
        ResponseHelper.success(res, 'Categories retrieved successfully', result.data);
    }),
    // 🆕 Create new category
    createCategory: catchAsync(async (req, res) => {
        const { name, image_url } = req.body;
        const result = await adminService.createCategory({ name, image_url });
        ResponseHelper.success(res, result.message, result.data, 201);
    }),
    // 🆕 Update category
    updateCategory: catchAsync(async (req, res) => {
        const categoryId = parseInt(req.params.id);
        const updateData = req.body;
        const result = await adminService.updateCategory(categoryId, updateData);
        ResponseHelper.success(res, result.message, result.data);
    }),
    // 🆕 Delete category
    deleteCategory: catchAsync(async (req, res) => {
        const categoryId = parseInt(req.params.id);
        const result = await adminService.deleteCategory(categoryId);
        ResponseHelper.success(res, result.message);
    }),
};
