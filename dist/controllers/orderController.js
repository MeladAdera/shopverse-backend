"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = void 0;
const orderService_js_1 = require("../services/orderService.js");
const errorTypes_js_1 = require("../ errors/errorTypes.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
const AppError_js_1 = require("../ errors/AppError.js");
exports.orderController = {
    // 🛒 Create new order from cart
    checkout: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const { shipping_address, shipping_city, shipping_phone } = req.body;
        if (!shipping_address || !shipping_city) {
            throw new AppError_js_1.AppError('Shipping address and city are required', 400);
        }
        const result = await orderService_js_1.orderService.checkout(userId, {
            shipping_address,
            shipping_city,
            shipping_phone
        });
        responseHelper_js_1.ResponseHelper.success(res, result.message, result.data, 201);
    }),
    // 🛒 Get user orders
    getOrders: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const result = await orderService_js_1.orderService.getUserOrders(userId, page, limit, status);
        responseHelper_js_1.ResponseHelper.success(res, 'Orders retrieved successfully', result.data);
    }),
    // 🛒 Get specific order
    getOrderById: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            throw new AppError_js_1.AppError('Invalid order ID', 400);
        }
        const result = await orderService_js_1.orderService.getUserOrderById(orderId, userId);
        responseHelper_js_1.ResponseHelper.success(res, 'Order details retrieved successfully', result.data);
    }),
    // 🛒 Cancel order
    cancelOrder: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            throw new AppError_js_1.AppError('Invalid order ID', 400);
        }
        const result = await orderService_js_1.orderService.cancelOrder(orderId, userId);
        responseHelper_js_1.ResponseHelper.success(res, result.message);
    })
};
