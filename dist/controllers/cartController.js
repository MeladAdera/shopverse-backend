import { cartService } from '../services/cartService.js';
import { catchAsync } from '../ errors/errorTypes.js';
import { ResponseHelper } from '../utils/responseHelper.js';
import { AppError } from '../ errors/AppError.js';
export const cartController = {
    // 🛒 Get cart contents
    getCart: catchAsync(async (req, res) => {
        const userId = req.user.id;
        const result = await cartService.getCart(userId);
        ResponseHelper.success(res, 'Cart contents retrieved successfully', result.data);
    }),
    // 🛒 Add product to cart
    addToCart: catchAsync(async (req, res) => {
        const userId = req.user.id;
        const { product_id, quantity } = req.body;
        // Validate required data
        if (!product_id || !quantity) {
            throw new AppError('Product ID and quantity are required', 400);
        }
        if (isNaN(product_id) || isNaN(quantity)) {
            throw new AppError('Invalid data', 400);
        }
        const result = await cartService.addToCart(userId, product_id, quantity);
        ResponseHelper.success(res, 'Product added to cart successfully', result.data);
    }),
    // 🛒 Update product quantity in cart
    updateCartItem: catchAsync(async (req, res) => {
        const userId = req.user.id;
        const cartItemId = parseInt(req.params.itemId);
        const { quantity } = req.body;
        if (!quantity || isNaN(quantity)) {
            throw new AppError('Quantity is required and must be a number', 400);
        }
        if (isNaN(cartItemId)) {
            throw new AppError('Invalid item ID', 400);
        }
        const result = await cartService.updateCartItem(userId, cartItemId, quantity);
        ResponseHelper.success(res, 'Quantity updated successfully', result.data);
    }),
    // 🛒 Remove product from cart
    removeFromCart: catchAsync(async (req, res) => {
        const userId = req.user.id;
        const cartItemId = parseInt(req.params.itemId);
        if (isNaN(cartItemId)) {
            throw new AppError('Invalid item ID', 400);
        }
        const result = await cartService.removeFromCart(userId, cartItemId);
        ResponseHelper.success(res, 'Product removed from cart successfully', result.data);
    }),
    // 🛒 Clear entire cart
    clearCart: catchAsync(async (req, res) => {
        const userId = req.user.id;
        const result = await cartService.clearCart(userId);
        ResponseHelper.success(res, result.message);
    }),
    // 🛒 Get number of items in cart
    getCartItemsCount: catchAsync(async (req, res) => {
        const userId = req.user.id;
        const result = await cartService.getCartItemsCount(userId);
        ResponseHelper.success(res, 'Items count retrieved successfully', result.data);
    })
};
