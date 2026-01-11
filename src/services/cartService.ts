// 📁 src/services/cartService.ts
import { cartRepository } from '../repositories/cartRepository.js';
import { AppError } from '../ errors/AppError.js';
import { CartWithItems, CartResponse } from '../models/Cart.js';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const cartService = {
  // 🛒 جلب محتويات الكارت
  async getCart(userId: number): Promise<ApiResponse<CartResponse>> {
    const cart = await cartRepository.getCartWithItems(userId);
    const totalPrice = await cartRepository.calculateCartTotal(userId);
    const itemsCount = await cartRepository.getCartItemsCount(userId);

    const response: CartResponse = {
      id: cart.id,
      user_id: cart.user_id,
      items_count: itemsCount,
      total_price: totalPrice,
      items: cart.items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        product_images: item.product_images,
        product_stock: item.product_stock,
        quantity: item.quantity,
        item_total: item.quantity * item.product_price
      }))
    };

    return {
      success: true,
      data: response
    };
  },

  // 🛒 إضافة منتج للكارت
  async addToCart(userId: number, productId: number, quantity: number): Promise<ApiResponse<CartResponse>> {
    if (!productId || quantity <= 0) {
      throw new AppError('بيانات غير صالحة', 400);
    }

    if (quantity > 10) {
      throw new AppError('لا يمكن إضافة أكثر من 10 قطع من نفس المنتج', 400);
    }

    const cart = await cartRepository.getOrCreateCart(userId);
    await cartRepository.addItemToCart(cart.id, productId, quantity);

    // إرجاع الكارت المحدث
    return this.getCart(userId);
  },

  // 🛒 تحديث كمية منتج في الكارت
  async updateCartItem(userId: number, cartItemId: number, quantity: number): Promise<ApiResponse<CartResponse>> {
    if (quantity <= 0) {
      throw new AppError('الكمية يجب أن تكون أكبر من الصفر', 400);
    }

    if (quantity > 10) {
      throw new AppError('لا يمكن إضافة أكثر من 10 قطع من نفس المنتج', 400);
    }

    // التحقق من ملكية العنصر
    const ownsItem = await cartRepository.verifyCartItemOwnership(cartItemId, userId);
    if (!ownsItem) {
      throw new AppError('ليس لديك صلاحية لتعديل هذا العنصر', 403);
    }

    await cartRepository.updateCartItem(cartItemId, quantity);

    return this.getCart(userId);
  },

  // 🛒 إزالة منتج من الكارت
  async removeFromCart(userId: number, cartItemId: number): Promise<ApiResponse<CartResponse>> {
    // التحقق من ملكية العنصر
    const ownsItem = await cartRepository.verifyCartItemOwnership(cartItemId, userId);
    if (!ownsItem) {
      throw new AppError('ليس لديك صلاحية لحذف هذا العنصر', 403);
    }

    const removed = await cartRepository.removeItemFromCart(cartItemId);
    
    if (!removed) {
      throw new AppError('العنصر غير موجود في الكارت', 404);
    }

    return this.getCart(userId);
  },

  // 🛒 تفريغ الكارت
  async clearCart(userId: number): Promise<ApiResponse<{ message: string }>> {
    const cart = await cartRepository.getOrCreateCart(userId);
    await cartRepository.clearCart(cart.id);

    return {
      success: true,
      message: 'تم تفريغ الكارت بنجاح'
    };
  },

  // 🛒 جلب عدد العناصر في الكارت
  async getCartItemsCount(userId: number): Promise<ApiResponse<{ count: number }>> {
    const count = await cartRepository.getCartItemsCount(userId);

    return {
      success: true,
      data: { count }
    };
  }
};