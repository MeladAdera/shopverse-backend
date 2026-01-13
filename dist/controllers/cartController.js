"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartController = void 0;
const cartService_js_1 = require("../services/cartService.js");
const errorTypes_js_1 = require("../ errors/errorTypes.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
const AppError_js_1 = require("../ errors/AppError.js");
exports.cartController = {
    // 🛒 Get cart contents
    getCart: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const result = await cartService_js_1.cartService.getCart(userId);
        responseHelper_js_1.ResponseHelper.success(res, 'Cart contents retrieved successfully', result.data);
    }),
    // 🛒 Add product to cart
    addToCart: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const { product_id, quantity } = req.body;
        // Validate required data
        if (!product_id || !quantity) {
            throw new AppError_js_1.AppError('Product ID and quantity are required', 400);
        }
        if (isNaN(product_id) || isNaN(quantity)) {
            throw new AppError_js_1.AppError('Invalid data', 400);
        }
        const result = await cartService_js_1.cartService.addToCart(userId, product_id, quantity);
        responseHelper_js_1.ResponseHelper.success(res, 'Product added to cart successfully', result.data);
    }),
    // 🛒 Update product quantity in cart
    updateCartItem: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const cartItemId = parseInt(req.params.itemId);
        const { quantity } = req.body;
        if (!quantity || isNaN(quantity)) {
            throw new AppError_js_1.AppError('Quantity is required and must be a number', 400);
        }
        if (isNaN(cartItemId)) {
            throw new AppError_js_1.AppError('Invalid item ID', 400);
        }
        const result = await cartService_js_1.cartService.updateCartItem(userId, cartItemId, quantity);
        responseHelper_js_1.ResponseHelper.success(res, 'Quantity updated successfully', result.data);
    }),
    // 🛒 Remove product from cart
    removeFromCart: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const cartItemId = parseInt(req.params.itemId);
        if (isNaN(cartItemId)) {
            throw new AppError_js_1.AppError('Invalid item ID', 400);
        }
        const result = await cartService_js_1.cartService.removeFromCart(userId, cartItemId);
        responseHelper_js_1.ResponseHelper.success(res, 'Product removed from cart successfully', result.data);
    }),
    // 🛒 Clear entire cart
    clearCart: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const result = await cartService_js_1.cartService.clearCart(userId);
        responseHelper_js_1.ResponseHelper.success(res, result.message);
    }),
    // 🛒 Get number of items in cart
    getCartItemsCount: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const userId = req.user.id;
        const result = await cartService_js_1.cartService.getCartItemsCount(userId);
        responseHelper_js_1.ResponseHelper.success(res, 'Items count retrieved successfully', result.data);
    })
};
