"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const adminRepository_js_1 = require("../repositories/adminRepository.js");
const AppError_js_1 = require("../ errors/AppError.js");
exports.adminService = {
    // Get all users
    async getUsers(page, limit) {
        if (page < 1 || limit < 1) {
            throw new AppError_js_1.AppError('Page number and limit must be greater than zero', 400);
        }
        const result = await adminRepository_js_1.adminRepository.getUsers(page, limit);
        return {
            success: true,
            data: {
                users: result.users,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            }
        };
    },
    // Get specific user
    async getUserById(userId) {
        if (!userId) {
            throw new AppError_js_1.AppError('User ID is required', 400);
        }
        const user = await adminRepository_js_1.adminRepository.getUserById(userId);
        if (!user) {
            throw new AppError_js_1.AppError('User not found', 404);
        }
        return {
            success: true,
            data: user
        };
    },
    /**
     * 🆕 Update user status مع تحقق الأمان
     * - يمنع المستخدم من تعطيل نفسه
     * - يتحقق من وجود المستخدم
     */
    async updateUserStatus(userId, active, currentAdminId) {
        if (!userId) {
            throw new AppError_js_1.AppError('User ID is required', 400);
        }
        // 🆕 التحقق: لا يمكن للمسؤول تعطيل نفسه
        if (currentAdminId && userId === currentAdminId && !active) {
            throw new AppError_js_1.AppError('You cannot block your own account', 403);
        }
        // 🆕 يمكن إضافة تحقق إضافي: لا يمكن تعطيل مسؤول آخر
        // (إذا كان النظام يريد فقط المدير الأعلى أن يعطل مسؤولين آخرين)
        const updated = await adminRepository_js_1.adminRepository.updateUserStatus(userId, active);
        if (!updated) {
            throw new AppError_js_1.AppError('User not found', 404);
        }
        return {
            success: true,
            message: active
                ? '✅ User account has been activated successfully'
                : '🚫 User account has been blocked successfully'
        };
    },
    // 🎯 Get dashboard statistics
    async getDashboardStats() {
        const [userStats, productStats, orderStats, revenueStats, recentOrders] = await Promise.all([
            adminRepository_js_1.adminRepository.getUserStats(),
            adminRepository_js_1.adminRepository.getProductStats(),
            adminRepository_js_1.adminRepository.getOrderStats(),
            adminRepository_js_1.adminRepository.getRevenueStats(),
            adminRepository_js_1.adminRepository.getRecentOrders()
        ]);
        return {
            success: true,
            data: {
                users: userStats,
                products: productStats,
                orders: orderStats,
                revenue: revenueStats,
                recent_orders: recentOrders,
                summary: {
                    total_revenue: revenueStats.total_revenue || 0,
                    total_orders: orderStats.total_orders || 0,
                    total_users: userStats.total_users || 0,
                    total_products: productStats.total_products || 0
                }
            }
        };
    },
    // 🆕 Get all orders
    async getOrders(page, limit, status) {
        if (page < 1 || limit < 1) {
            throw new AppError_js_1.AppError('Page number and limit must be greater than zero', 400);
        }
        const result = await adminRepository_js_1.adminRepository.getOrders(page, limit, status);
        return {
            success: true,
            data: {
                orders: result.orders,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            }
        };
    },
    async getOrderById(orderId) {
        if (!orderId) {
            throw new AppError_js_1.AppError('Order ID is required', 400);
        }
        const order = await adminRepository_js_1.adminRepository.getOrderById(orderId);
        if (!order) {
            throw new AppError_js_1.AppError('Order not found', 404);
        }
        return {
            success: true,
            data: order
        };
    },
    // 🆕 Update order status
    async updateOrderStatus(orderId, status) {
        if (!orderId) {
            throw new AppError_js_1.AppError('Order ID is required', 400);
        }
        // Validate allowed statuses
        const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            throw new AppError_js_1.AppError(`Invalid order status. Allowed statuses: ${allowedStatuses.join(', ')}`, 400);
        }
        const updated = await adminRepository_js_1.adminRepository.updateOrderStatus(orderId, status);
        if (!updated) {
            throw new AppError_js_1.AppError('Order not found', 404);
        }
        return {
            success: true,
            message: `Order status updated to "${this.getStatusText(status)}" successfully`
        };
    },
    // 🆕 Helper function to convert status to text
    getStatusText(status) {
        const statusMap = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    },
    // 🆕 Get all categories
    async getCategories(page, limit) {
        if (page < 1 || limit < 1) {
            throw new AppError_js_1.AppError('Page number and limit must be greater than zero', 400);
        }
        const result = await adminRepository_js_1.adminRepository.getCategories(page, limit);
        return {
            success: true,
            data: {
                categories: result.categories,
                pagination: {
                    page, limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            }
        };
    },
    // 🆕 Create new category
    async createCategory(categoryData) {
        const { name, image_url } = categoryData;
        if (!name || name.trim().length === 0) {
            throw new AppError_js_1.AppError('Category name is required', 400);
        }
        const category = await adminRepository_js_1.adminRepository.createCategory({ name, image_url });
        return {
            success: true,
            message: 'Category created successfully',
            data: category
        };
    },
    // 🆕 Update category
    async updateCategory(categoryId, updateData) {
        if (!categoryId) {
            throw new AppError_js_1.AppError('Category ID is required', 400);
        }
        if (updateData.name && updateData.name.trim().length === 0) {
            throw new AppError_js_1.AppError('Category name cannot be empty', 400);
        }
        const updated = await adminRepository_js_1.adminRepository.updateCategory(categoryId, updateData);
        if (!updated) {
            throw new AppError_js_1.AppError('Category not found', 404);
        }
        return {
            success: true,
            message: 'Category updated successfully',
            data: updated
        };
    },
    // 🆕 Delete category
    async deleteCategory(categoryId) {
        if (!categoryId) {
            throw new AppError_js_1.AppError('Category ID is required', 400);
        }
        const deleted = await adminRepository_js_1.adminRepository.deleteCategory(categoryId);
        if (!deleted) {
            throw new AppError_js_1.AppError('Category not found', 404);
        }
        return {
            success: true,
            message: 'Category deleted successfully'
        };
    },
};
