// 📁 src/repositories/userRepository.ts
import { query } from '../config/database.js';
export const userRepository = {
    /**
     * Create a new user
     */
    async create(userData) {
        const { name, email, password_hash, role = 'user' } = userData;
        const result = await query(`INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, created_at`, [name, email, password_hash, role]);
        return result.rows[0];
    },
    /**
     * Find user by email (للاستخدام الداخلي - يعيد active)
     */
    async findByEmail(email) {
        const result = await query('SELECT id, name, email, password_hash, role, active, created_at FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    },
    /**
     * Find user by ID - بدون active للمستخدم العادي
     */
    async findById(id) {
        const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
    /**
     * Find user by ID with password (للاستخدام الداخلي)
     */
    async findByIdWithPassword(id) {
        const result = await query('SELECT id, name, email, password_hash, role, active, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
    /**
     * Check if email exists
     */
    async emailExists(email) {
        const result = await query('SELECT 1 FROM users WHERE email = $1', [email]);
        return result.rows.length > 0;
    },
    /**
     * Get all users (للمستخدم العادي - بدون active)
     */
    async findAll() {
        const result = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        return result.rows;
    },
    /**
     * Update user data (للمستخدم العادي - بدون active)
     */
    async update(userId, updateData) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (updateData.name) {
            fields.push(`name = $${paramCount}`);
            values.push(updateData.name);
            paramCount++;
        }
        if (updateData.email) {
            fields.push(`email = $${paramCount}`);
            values.push(updateData.email);
            paramCount++;
        }
        if (updateData.role) {
            fields.push(`role = $${paramCount}`);
            values.push(updateData.role);
            paramCount++;
        }
        if (updateData.password_hash) {
            fields.push(`password_hash = $${paramCount}`);
            values.push(updateData.password_hash);
            paramCount++;
        }
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }
        values.push(userId);
        // 🆕 إزالة updated_at من الاستعلام
        const result = await query(`UPDATE users SET ${fields.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, name, email, role, created_at`, values);
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        return result.rows[0];
    },
    /**
     * Delete user
     */
    async delete(userId) {
        const result = await query('DELETE FROM users WHERE id = $1', [userId]);
        return (result.rowCount || 0) > 0;
    },
    /**
     * Update password
     */
    async updatePassword(userId, newPasswordHash) {
        const result = await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
        if ((result.rowCount || 0) === 0) {
            throw new Error('User not found');
        }
    },
    /**
    * 🆕 الحصول على حالة المستخدم فقط (active) - لتحسين الأداء
    * يستخدم في middleware للتحقق من حالة المستخدم فقط
    */
    async getUserStatus(userId) {
        const result = await query('SELECT active FROM users WHERE id = $1', [userId]);
        return result.rows[0] || null;
    },
    /**
     * 🆕 الحصول على بيانات المستخدم للتوكنات فقط
     * لا تشمل password_hash، تشمل name
     */
    async findForToken(userId) {
        const result = await query('SELECT id, name, email, role, active FROM users WHERE id = $1', [userId]);
        return result.rows[0] || null;
    },
    /**
     * 🆕 تحديث حالة المستخدم (active) - للإدارة
     */
    async updateStatus(userId, active) {
        const result = await query('UPDATE users SET active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [active, userId]);
        if ((result.rowCount || 0) === 0) {
            throw new Error('User not found');
        }
    }
};
