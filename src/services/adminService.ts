import { adminRepository } from '../repositories/adminRepository.js';
import { AppError } from '../ errors/AppError.js';
import { UserForAdmin, SafeUser } from '../models/User.js';
import { DashboardStats } from '../types/statsTypes.js';

// 🎯 Response types
interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: any;
  data?: T;
}

export const adminService = {
  // Get all users
  async getUsers(page: number, limit: number): Promise<ApiResponse<PaginatedResponse<UserForAdmin>>> {
    if (page < 1 || limit < 1) {
      throw new AppError('Page number and limit must be greater than zero', 400);
    }

    const result = await adminRepository.getUsers(page, limit);
    
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
  async getUserById(userId: number): Promise<ApiResponse<SafeUser>> {
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const user = await adminRepository.getUserById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
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
  async updateUserStatus(userId: number, active: boolean, currentAdminId?: number): Promise<ApiResponse<null>> {
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    // 🆕 التحقق: لا يمكن للمسؤول تعطيل نفسه
    if (currentAdminId && userId === currentAdminId && !active) {
      throw new AppError('You cannot block your own account', 403);
    }

    // 🆕 يمكن إضافة تحقق إضافي: لا يمكن تعطيل مسؤول آخر
    // (إذا كان النظام يريد فقط المدير الأعلى أن يعطل مسؤولين آخرين)

    const updated = await adminRepository.updateUserStatus(userId, active);
    
    if (!updated) {
      throw new AppError('User not found', 404);
    }

    return {
      success: true,
      message: active 
        ? '✅ User account has been activated successfully' 
        : '🚫 User account has been blocked successfully'
    };
  },

  // 🎯 Get dashboard statistics
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const [
      userStats,
      productStats, 
      orderStats,
      revenueStats,
      recentOrders
    ] = await Promise.all([
      adminRepository.getUserStats(),
      adminRepository.getProductStats(),
      adminRepository.getOrderStats(), 
      adminRepository.getRevenueStats(),
      adminRepository.getRecentOrders()
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
  async getOrders(page: number, limit: number, status?: string) {
    if (page < 1 || limit < 1) {
      throw new AppError('Page number and limit must be greater than zero', 400);
    }

    const result = await adminRepository.getOrders(page, limit, status);
    
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

  async getOrderById(orderId: number) {
    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    const order = await adminRepository.getOrderById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return {
      success: true,
      data: order
    };
  },

  // 🆕 Update order status
  async updateOrderStatus(orderId: number, status: string) {
    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    // Validate allowed statuses
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      throw new AppError(`Invalid order status. Allowed statuses: ${allowedStatuses.join(', ')}`, 400);
    }

    const updated = await adminRepository.updateOrderStatus(orderId, status);
    
    if (!updated) {
      throw new AppError('Order not found', 404);
    }

    return {
      success: true,
      message: `Order status updated to "${this.getStatusText(status)}" successfully`
    };
  },

  // 🆕 Helper function to convert status to text
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  },

  // 🆕 Get all categories
  async getCategories(page: number, limit: number) {
    if (page < 1 || limit < 1) {
      throw new AppError('Page number and limit must be greater than zero', 400);
    }
    const result = await adminRepository.getCategories(page, limit);
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
  async createCategory(categoryData: { name: string; image_url?: string }) {
    const { name, image_url } = categoryData;

    if (!name || name.trim().length === 0) {
      throw new AppError('Category name is required', 400);
    }

    const category = await adminRepository.createCategory({ name, image_url });
    
    return {
      success: true,
      message: 'Category created successfully',
      data: category
    };
  },

  // 🆕 Update category
  async updateCategory(categoryId: number, updateData: { name?: string; image_url?: string }) {
    if (!categoryId) {
      throw new AppError('Category ID is required', 400);
    }

    if (updateData.name && updateData.name.trim().length === 0) {
      throw new AppError('Category name cannot be empty', 400);
    }

    const updated = await adminRepository.updateCategory(categoryId, updateData);
    
    if (!updated) {
      throw new AppError('Category not found', 404);
    }

    return {
      success: true,
      message: 'Category updated successfully',
      data: updated
    };
  },

  // 🆕 Delete category
  async deleteCategory(categoryId: number) {
    if (!categoryId) {
      throw new AppError('Category ID is required', 400);
    }

    const deleted = await adminRepository.deleteCategory(categoryId);
    
    if (!deleted) {
      throw new AppError('Category not found', 404);
    }

    return {
      success: true,
      message: 'Category deleted successfully'
    };
  },
};