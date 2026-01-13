"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRepository = void 0;
// 📁 src/repositories/cartRepository.ts
const database_js_1 = require("../config/database.js");
exports.cartRepository = {
    // 🎯 Create or get user's cart
    async getOrCreateCart(userId) {
        const existingCart = await (0, database_js_1.query)('SELECT * FROM cart WHERE user_id = $1', [userId]);
        if (existingCart.rows.length > 0) {
            return existingCart.rows[0];
        }
        const newCart = await (0, database_js_1.query)('INSERT INTO cart (user_id) VALUES ($1) RETURNING *', [userId]);
        return newCart.rows[0];
    },
    // 🎯 Add product to cart with stock verification
    async addItemToCart(cartId, productId, quantity) {
        // Verify product availability
        const product = await this.getProductInfo(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (!product.active) {
            throw new Error('Product is currently unavailable');
        }
        if (product.stock < quantity) {
            throw new Error(`Quantity not available. Available: ${product.stock}`);
        }
        // Check if product already exists in cart
        const existingItem = await (0, database_js_1.query)('SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
        if (existingItem.rows.length > 0) {
            // Update quantity if exists
            const updatedItem = await (0, database_js_1.query)('UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *', [quantity, cartId, productId]);
            return updatedItem.rows[0];
        }
        else {
            // Add new item if not exists
            const newItem = await (0, database_js_1.query)('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *', [cartId, productId, quantity]);
            return newItem.rows[0];
        }
    },
    // 🎯 Update product quantity in cart
    async updateCartItem(cartItemId, quantity) {
        if (quantity <= 0) {
            // If quantity is 0, delete the item
            await this.removeItemFromCart(cartItemId);
            throw new Error('Item removed from cart');
        }
        // Verify stock availability for new quantity
        const cartItem = await this.getCartItemById(cartItemId);
        if (!cartItem) {
            throw new Error('Item not found in cart');
        }
        const product = await this.getProductInfo(cartItem.product_id);
        if (product && product.stock < quantity) {
            throw new Error(`Quantity not available. Available: ${product.stock}`);
        }
        const result = await (0, database_js_1.query)('UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *', [quantity, cartItemId]);
        return result.rows[0];
    },
    // 🎯 Remove product from cart
    async removeItemFromCart(cartItemId) {
        const result = await (0, database_js_1.query)('DELETE FROM cart_items WHERE id = $1 RETURNING id', [cartItemId]);
        return result.rows.length > 0;
    },
    // 🎯 Get cart with all items and information
    async getCartWithItems(userId) {
        const cartResult = await (0, database_js_1.query)('SELECT * FROM cart WHERE user_id = $1', [userId]);
        if (cartResult.rows.length === 0) {
            throw new Error('Cart not found');
        }
        const cart = cartResult.rows[0];
        const itemsResult = await (0, database_js_1.query)(`SELECT 
        ci.*,
        p.name as product_name,
        p.price as product_price,
        p.image_urls as product_images,
        p.stock as product_stock,
        p.active as product_active
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC`, [cart.id]);
        return {
            ...cart,
            items: itemsResult.rows
        };
    },
    // 🎯 Clear entire cart
    async clearCart(cartId) {
        await (0, database_js_1.query)('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
        return true;
    },
    // 🎯 Get specific cart item
    async getCartItemById(cartItemId) {
        const result = await (0, database_js_1.query)('SELECT * FROM cart_items WHERE id = $1', [cartItemId]);
        return result.rows[0] || null;
    },
    // 🎯 Verify item ownership by user
    async verifyCartItemOwnership(cartItemId, userId) {
        const result = await (0, database_js_1.query)(`SELECT ci.id 
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       WHERE ci.id = $1 AND c.user_id = $2`, [cartItemId, userId]);
        return result.rows.length > 0;
    },
    // 🎯 Get number of items in cart
    async getCartItemsCount(userId) {
        const result = await (0, database_js_1.query)(`SELECT COUNT(ci.id) as items_count
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       WHERE c.user_id = $1`, [userId]);
        return parseInt(result.rows[0].items_count) || 0;
    },
    // 🎯 Get product information
    async getProductInfo(productId) {
        const result = await (0, database_js_1.query)('SELECT id, name, price, stock, active FROM products WHERE id = $1', [productId]);
        return result.rows[0] || null;
    },
    // 🎯 Calculate cart total price
    async calculateCartTotal(userId) {
        const result = await (0, database_js_1.query)(`SELECT SUM(ci.quantity * p.price) as total
       FROM cart_items ci
       JOIN cart c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE c.user_id = $1 AND p.active = true`, [userId]);
        return parseFloat(result.rows[0].total) || 0;
    }
};
