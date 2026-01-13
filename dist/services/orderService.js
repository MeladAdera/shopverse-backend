"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = void 0;
//src/services/orderService.ts
const orderRepository_js_1 = require("../repositories/orderRepository.js");
const cartRepository_js_1 = require("../repositories/cartRepository.js");
const AppError_js_1 = require("../ errors/AppError.js");
exports.orderService = {
    // 🛒 Create new order from cart
    async checkout(userId, shippingInfo) {
        // 1. Get cart and verify contents
        const cart = await cartRepository_js_1.cartRepository.getCartWithItems(userId);
        if (!cart.items || cart.items.length === 0) {
            throw new AppError_js_1.AppError('Cart is empty', 400);
        }
        // 2. Verify all products are available in stock
        for (const item of cart.items) {
            if (!item.product_active) {
                throw new AppError_js_1.AppError(`Product "${item.product_name}" is currently unavailable`, 400);
            }
            if (item.product_stock < item.quantity) {
                throw new AppError_js_1.AppError(`Insufficient quantity for product "${item.product_name}". Available: ${item.product_stock}`, 400);
            }
        }
        // 3. Calculate total price
        const totalPrice = await cartRepository_js_1.cartRepository.calculateCartTotal(userId);
        const cartData = {
            ...cart,
            total_price: totalPrice
        };
        // 4. Create order
        const order = await orderRepository_js_1.orderRepository.createOrderFromCart(userId, cartData, shippingInfo);
        // 5. Clear cart
        await cartRepository_js_1.cartRepository.clearCart(cart.id);
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
    async getUserOrders(userId, page, limit, status) {
        if (page < 1 || limit < 1) {
            throw new AppError_js_1.AppError('Page number and limit must be greater than zero', 400);
        }
        const result = await orderRepository_js_1.orderRepository.getUserOrders(userId, page, limit, status);
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
    async getUserOrderById(orderId, userId) {
        if (!orderId) {
            throw new AppError_js_1.AppError('Order ID is required', 400);
        }
        const order = await orderRepository_js_1.orderRepository.getUserOrderById(orderId, userId);
        if (!order) {
            throw new AppError_js_1.AppError('Order not found', 404);
        }
        return {
            success: true,
            data: order
        };
    },
    // 🛒 Cancel order
    async cancelOrder(orderId, userId) {
        if (!orderId) {
            throw new AppError_js_1.AppError('Order ID is required', 400);
        }
        const cancelled = await orderRepository_js_1.orderRepository.cancelOrder(orderId, userId);
        if (!cancelled) {
            throw new AppError_js_1.AppError('Cannot cancel this order', 400);
        }
        return {
            success: true,
            message: 'Order cancelled successfully'
        };
    }
};
