import { query } from '../config/database.js';
export const reviewRepository = {
    // 1️⃣ Create new review
    async create(reviewData) {
        const { user_id, product_id, rating, comment } = reviewData;
        const result = await query(`INSERT INTO reviews (user_id, product_id, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`, [user_id, product_id, rating, comment]);
        return result.rows[0];
    },
    // 2️⃣ Get reviews for a specific product (with user data)
    async getByProductId(productId) {
        const result = await query(`SELECT r.*, u.name as user_name, u.email as user_email 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`, [productId]);
        return result.rows;
    },
    // 3️⃣ Get review statistics for a product
    async getSummary(productId) {
        const result = await query(`SELECT 
         AVG(rating) as average_rating,
         COUNT(*) as total_reviews,
         COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1,
         COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
         COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
         COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
         COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5
       FROM reviews 
       WHERE product_id = $1`, [productId]);
        const row = result.rows[0];
        return {
            average_rating: parseFloat(row.average_rating) || 0,
            total_reviews: parseInt(row.total_reviews) || 0,
            rating_distribution: {
                1: parseInt(row.rating_1) || 0,
                2: parseInt(row.rating_2) || 0,
                3: parseInt(row.rating_3) || 0,
                4: parseInt(row.rating_4) || 0,
                5: parseInt(row.rating_5) || 0
            }
        };
    },
    // 4️⃣ Check if user has reviewed the product before
    async userHasReviewed(productId, userId) {
        const result = await query('SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2', [productId, userId]);
        return result.rows.length > 0;
    },
    // 5️⃣ Delete review
    async delete(reviewId, userId) {
        const result = await query('DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id', [reviewId, userId]);
        return result.rows.length > 0;
    }
};
