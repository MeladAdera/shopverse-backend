// 📁 src/controllers/orderController.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { orderService } from '../services/orderService.js';
import { catchAsync } from '../ errors/errorTypes.js';
import { ResponseHelper } from '../utils/responseHelper.js';
import { AppError } from '../ errors/AppError.js';

export const orderController = {
  // 🛒 Create new order from cart
  checkout: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { shipping_address, shipping_city, shipping_phone } = req.body;

    if (!shipping_address || !shipping_city) {
      throw new AppError('Shipping address and city are required', 400);
    }

    const result = await orderService.checkout(userId, {
      shipping_address,
      shipping_city, 
      shipping_phone
    });

    ResponseHelper.success(res, result.message, result.data, 201);
  }),

  // 🛒 Get user orders
  getOrders: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const result = await orderService.getUserOrders(userId, page, limit, status);
    ResponseHelper.success(res, 'Orders retrieved successfully', result.data);
  }),

  // 🛒 Get specific order
  getOrderById: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    const result = await orderService.getUserOrderById(orderId, userId);
    ResponseHelper.success(res, 'Order details retrieved successfully', result.data);
  }),

  // 🛒 Cancel order
  cancelOrder: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }

    const result = await orderService.cancelOrder(orderId, userId);
    ResponseHelper.success(res, result.message);
  })
};