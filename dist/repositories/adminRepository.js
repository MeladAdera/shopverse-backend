"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRepository = void 0;
// 📁 src/repositories/adminRepository.ts
const database_js_1 = require("../config/database.js");
exports.adminRepository = {
    // User management
    async getUsers(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const usersResult = await (0, database_js_1.query)(`SELECT id, name, email, role, active, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`, [limit, offset]);
        const totalResult = await (0, database_js_1.query)('SELECT COUNT(*) FROM users');
        const total = parseInt(totalResult.rows[0].count) || 0;
        return {
            users: usersResult.rows,
            total
        };
    },
    async getUserById(userId) {
        const result = await (0, database_js_1.query)('SELECT id, name, email, role, active, created_at FROM users WHERE id = $1', [userId]);
        return result.rows[0] || null;
    },
    async updateUserStatus(userId, active) {
        const result = await (0, database_js_1.query)('UPDATE users SET active = $1 WHERE id = $2 RETURNING id', [active, userId]);
        return result.rows.length > 0;
    },
    // 🎯 User statistics - with type
    async getUserStats() {
        const result = await (0, database_js_1.query)(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week
      FROM users
    `);
        const row = result.rows[0];
        return {
            total_users: parseInt(row.total_users) || 0,
            active_users: parseInt(row.active_users) || 0,
            admin_users: parseInt(row.admin_users) || 0,
            new_users_week: parseInt(row.new_users_week) || 0
        };
    },
    // 🎯 Product statistics - with type
    async getProductStats() {
        const result = await (0, database_js_1.query)(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock,
        COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN active = false THEN 1 END) as inactive_products,
        COALESCE(SUM(sales_count), 0) as total_sales
      FROM products
    `);
        const row = result.rows[0];
        return {
            total_products: parseInt(row.total_products) || 0,
            in_stock: parseInt(row.in_stock) || 0,
            out_of_stock: parseInt(row.out_of_stock) || 0,
            inactive_products: parseInt(row.inactive_products) || 0,
            total_sales: parseInt(row.total_sales) || 0
        };
    },
    // 🎯 Order statistics - with type
    async getOrderStats() {
        const result = await (0, database_js_1.query)(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_orders_week
      FROM orders
    `);
        const row = result.rows[0];
        return {
            total_orders: parseInt(row.total_orders) || 0,
            pending_orders: parseInt(row.pending_orders) || 0,
            confirmed_orders: parseInt(row.confirmed_orders) || 0,
            shipped_orders: parseInt(row.shipped_orders) || 0,
            delivered_orders: parseInt(row.delivered_orders) || 0,
            new_orders_week: parseInt(row.new_orders_week) || 0
        };
    },
    // 🎯 Revenue statistics - with type
    async getRevenueStats() {
        const result = await (0, database_js_1.query)(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as confirmed_revenue,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN total_amount ELSE 0 END), 0) as revenue_30_days
      FROM orders
    `);
        const row = result.rows[0];
        return {
            total_revenue: parseFloat(row.total_revenue) || 0,
            confirmed_revenue: parseFloat(row.confirmed_revenue) || 0,
            revenue_30_days: parseFloat(row.revenue_30_days) || 0
        };
    },
    // 🎯 Recent orders - with type
    async getRecentOrders() {
        const result = await (0, database_js_1.query)(`
      SELECT 
        o.id, o.total_amount, o.status, o.created_at,
        u.name as customer_name,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
        return result.rows;
    },
    // 🎯 Search functions - with type
    async searchUsers(searchTerm, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const searchPattern = `%${searchTerm}%`;
        const usersResult = await (0, database_js_1.query)(`SELECT id, name, email, role, active, created_at 
       FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`, [searchPattern, limit, offset]);
        const totalResult = await (0, database_js_1.query)('SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1', [searchPattern]);
        const total = parseInt(totalResult.rows[0].count) || 0;
        return {
            users: usersResult.rows,
            total,
            page,
            limit
        };
    },
    // 🎯 Update user role - with type
    async updateUserRole(userId, role) {
        const result = await (0, database_js_1.query)('UPDATE users SET role = $1 WHERE id = $2 RETURNING id', [role, userId]);
        return result.rows.length > 0;
    },
    // 🆕 Get all orders with filtering
    async getOrders(page = 1, limit = 10, status) {
        const offset = (page - 1) * limit;
        // Build dynamic query
        let whereClause = '';
        const queryParams = [limit, offset];
        let paramCount = 3;
        if (status) {
            whereClause = 'WHERE o.status = $3';
            queryParams.push(status);
        }
        const ordersResult = await (0, database_js_1.query)(`SELECT 
        o.id, 
        o.total_amount, 
        o.status, 
        o.created_at,
        o.updated_at,
        u.name as customer_name,
        u.email as customer_email,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC 
      LIMIT $1 OFFSET $2`, queryParams);
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM orders o';
        let countParams = [];
        if (status) {
            countQuery += ' WHERE o.status = $1';
            countParams.push(status);
        }
        const totalResult = await (0, database_js_1.query)(countQuery, countParams);
        const total = parseInt(totalResult.rows[0].count) || 0;
        return {
            orders: ordersResult.rows,
            total
        };
    },
    async getOrderById(orderId) {
        // Get basic order data
        const orderResult = await (0, database_js_1.query)(`SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1`, [orderId]);
        if (orderResult.rows.length === 0) {
            return null;
        }
        const order = orderResult.rows[0];
        // Get order items
        const itemsResult = await (0, database_js_1.query)(`SELECT 
        oi.*,
        p.name as product_name,
        p.image_urls as product_images
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`, [orderId]);
        return {
            ...order,
            items: itemsResult.rows
        };
    },
    async updateOrderStatus(orderId, status) {
        // 1. Get order and its items first
        const order = await this.getOrderById(orderId);
        if (!order)
            return false;
        const oldStatus = order.status;
        // 2. Update order status
        const result = await (0, database_js_1.query)('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id', [status, orderId]);
        if (result.rows.length === 0)
            return false;
        // 3. 🆕 Update product counters based on status change
        await this.updateProductCounters(order.items, oldStatus, status);
        return true;
    },
    // 🆕 Helper function to update product counters
    async updateProductCounters(items, oldStatus, newStatus) {
        for (const item of items) {
            const productId = item.product_id;
            const quantity = item.quantity;
            try {
                // 📊 Counter update logic based on status change
                if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
                    // If cancelled - increase counter
                    await (0, database_js_1.query)('UPDATE products SET stock = stock + $1 WHERE id = $2', [quantity, productId]);
                    console.log(`✅ Returned ${quantity} units for product ${productId}`);
                }
                else if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
                    // If confirmed - decrease counter
                    await (0, database_js_1.query)('UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1', [quantity, productId]);
                    console.log(`🔻 Deducted ${quantity} units from product ${productId}`);
                }
                else if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
                    // If was cancelled and became not cancelled - decrease counter
                    await (0, database_js_1.query)('UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1', [quantity, productId]);
                    console.log(`🔻 Deducted ${quantity} units from product ${productId} (cancellation revoked)`);
                }
            }
            catch (error) {
                console.error(`❌ Failed to update product ${productId}:`, error);
                // Continue with other items and don't stop the process
            }
        }
    },
    // 🆕 Get all categories
    async getCategories(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const categoriesResult = await (0, database_js_1.query)(`SELECT 
        c.*,
        COUNT(p.id) as products_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.created_at DESC 
      LIMIT $1 OFFSET $2`, [limit, offset]);
        const totalResult = await (0, database_js_1.query)('SELECT COUNT(*) FROM categories');
        const total = parseInt(totalResult.rows[0].count) || 0;
        return {
            categories: categoriesResult.rows,
            total
        };
    },
    // 🆕 Create new category
    async createCategory(categoryData) {
        const { name, image_url } = categoryData;
        const result = await (0, database_js_1.query)(`INSERT INTO categories (name, image_url) 
       VALUES ($1, $2) 
       RETURNING *`, [name, image_url]);
        return result.rows[0];
    },
    // 🆕 Update category
    async updateCategory(categoryId, updateData) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (updateData.name) {
            fields.push(`name = $${paramCount}`);
            values.push(updateData.name);
            paramCount++;
        }
        if (updateData.image_url !== undefined) {
            fields.push(`image_url = $${paramCount}`);
            values.push(updateData.image_url);
            paramCount++;
        }
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }
        values.push(categoryId);
        const result = await (0, database_js_1.query)(`UPDATE categories SET ${fields.join(', ')}
       WHERE id = $${paramCount} 
       RETURNING *`, values);
        return result.rows[0] || null;
    },
    // 🆕 Delete category
    async deleteCategory(categoryId) {
        const result = await (0, database_js_1.query)('DELETE FROM categories WHERE id = $1 RETURNING id', [categoryId]);
        return result.rows.length > 0;
    },
};
