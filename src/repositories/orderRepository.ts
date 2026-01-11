//src/repositories/orderRepository.ts
import { query } from '../config/database.js';
import { pool } from '../config/database.js'; // ⬅️ Add this

export const orderRepository = {
  // 🎯 Create new order from cart
  async createOrderFromCart(userId: number, cartData: any, shippingInfo: any): Promise<any> {
    const client = await pool.connect(); 
    try {
      await client.query('BEGIN');

      // 1. Create order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, shipping_address, shipping_city, shipping_phone, status) 
         VALUES ($1, $2, $3, $4, $5, 'pending') 
         RETURNING *`,
        [userId, cartData.total_price, shippingInfo.shipping_address, 
         shippingInfo.shipping_city, shippingInfo.shipping_phone]
      );

      const order = orderResult.rows[0];

      // 2. Add order items
      for (const item of cartData.items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.product_id, item.quantity, item.product_price]
        );

        // 3. Deduct quantities from stock directly
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');
      return order;

    } catch (error: any) { // ⬅️ Add :any for error
      await client.query('ROLLBACK');
      throw new Error(`Failed to create order: ${error.message}`);
    } finally {
      client.release();
    }
  },

  // 🎯 Get only user's orders
  async getUserOrders(userId: number, page: number = 1, limit: number = 10, status?: string): Promise<{ 
    orders: any[];
    total: number;
  }> {
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE o.user_id = $3';
    const queryParams: any[] = [limit, offset, userId];
    let paramCount = 4;

    if (status) {
      whereClause += ' AND o.status = $4';
      queryParams.push(status);
    }

    const ordersResult = await query(
      `SELECT 
        o.id, 
        o.total_amount, 
        o.status, 
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC 
      LIMIT $1 OFFSET $2`,
      queryParams
    );
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM orders o WHERE o.user_id = $1';
    let countParams: any[] = [userId];
    
    if (status) {
      countQuery += ' AND o.status = $2';
      countParams.push(status);
    }
    
    const totalResult = await query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].count) || 0;
    
    return {
      orders: ordersResult.rows,
      total
    };
  },

  // 🎯 Get specific order for user (with ownership verification)
  async getUserOrderById(orderId: number, userId: number): Promise<any> {
    const orderResult = await query(
      `SELECT 
        o.*
      FROM orders o
      WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.image_urls as product_images
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`,
      [orderId]
    );

    return {
      ...order,
      items: itemsResult.rows
    };
  },

  // 🎯 Cancel order (for user) - only if pending
  async cancelOrder(orderId: number, userId: number): Promise<boolean> {
    const result = await query(
      `UPDATE orders 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING id`,
      [orderId, userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    // Return quantities to stock
    const itemsResult = await query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );

    for (const item of itemsResult.rows) {
      await query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    return true;
  },

  // 🎯 Verify order ownership
  async verifyOrderOwnership(orderId: number, userId: number): Promise<boolean> {
    const result = await query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    return result.rows.length > 0;
  }
};