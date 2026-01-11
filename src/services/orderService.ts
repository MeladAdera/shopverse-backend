//src/services/orderService.ts
import { orderRepository } from '../repositories/orderRepository.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { AppError } from '../ errors/AppError.js';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const orderService = {
  // 🛒 Create new order from cart
  async checkout(userId: number, shippingInfo: any): Promise<ApiResponse<any>> {
    // 1. Get cart and verify contents
    const cart = await cartRepository.getCartWithItems(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // 2. Verify all products are available in stock
    for (const item of cart.items) {
      if (!item.product_active) {
        throw new AppError(`Product "${item.product_name}" is currently unavailable`, 400);
      }
      if (item.product_stock < item.quantity) {
        throw new AppError(`Insufficient quantity for product "${item.product_name}". Available: ${item.product_stock}`, 400);
      }
    }

    // 3. Calculate total price
    const totalPrice = await cartRepository.calculateCartTotal(userId);

    const cartData = {
      ...cart,
      total_price: totalPrice
    };

    // 4. Create order
    const order = await orderRepository.createOrderFromCart(userId, cartData, shippingInfo);

    // 5. Clear cart
    await cartRepository.clearCart(cart.id);

    return {
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at
      }
    };
  },

  // 🛒 Get user orders
  async getUserOrders(userId: number, page: number, limit: number, status?: string): Promise<ApiResponse<any>> {
    if (page < 1 || limit < 1) {
      throw new AppError('Page number and limit must be greater than zero', 400);
    }

    const result = await orderRepository.getUserOrders(userId, page, limit, status);
    
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

  // 🛒 Get specific user order
  async getUserOrderById(orderId: number, userId: number): Promise<ApiResponse<any>> {
    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    const order = await orderRepository.getUserOrderById(orderId, userId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return {
      success: true,
      data: order
    };
  },

  // 🛒 Cancel order
  async cancelOrder(orderId: number, userId: number): Promise<ApiResponse<{ message: string }>> {
    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    const cancelled = await orderRepository.cancelOrder(orderId, userId);
    
    if (!cancelled) {
      throw new AppError('Cannot cancel this order', 400);
    }

    return {
      success: true,
      message: 'Order cancelled successfully'
    };
  }
};