"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = void 0;
const reviewRepository_js_1 = require("../repositories/reviewRepository.js");
const AppError_js_1 = require("../ errors/AppError.js");
exports.reviewService = {
    // 1️⃣ Create new review with condition validation
    async createReview(reviewData) {
        const { user_id, product_id, rating } = reviewData;
        // TBD use validation
        // Verify that rating is between 1-5
        if (rating < 1 || rating > 5) {
            throw new AppError_js_1.AppError('Rating must be between 1 and 5 stars', 400);
        }
        // Verify that user hasn't reviewed this product before
        const hasReviewed = await reviewRepository_js_1.reviewRepository.userHasReviewed(product_id, user_id);
        if (hasReviewed) {
            throw new AppError_js_1.AppError('You have already reviewed this product', 400);
        }
        // Create the review
        const review = await reviewRepository_js_1.reviewRepository.create(reviewData);
        return {
            success: true,
            message: 'Review added successfully',
            data: review
        };
    },
    // 2️⃣ Get product reviews
    async getProductReviews(productId) {
        if (!productId) {
            throw new AppError_js_1.AppError('Product ID is required', 400);
        }
        const reviews = await reviewRepository_js_1.reviewRepository.getByProductId(productId);
        return reviews;
    },
    // 3️⃣ Get review statistics
    async getProductReviewsSummary(productId) {
        if (!productId) {
            throw new AppError_js_1.AppError('Product ID is required', 400);
        }
        const summary = await reviewRepository_js_1.reviewRepository.getSummary(productId);
        return summary;
    },
    // 4️⃣ Delete review (only review owner can delete)
    async deleteReview(reviewId, userId) {
        const deleted = await reviewRepository_js_1.reviewRepository.delete(reviewId, userId);
        if (!deleted) {
            throw new AppError_js_1.AppError('Review not found or you do not have permission to delete', 404);
        }
        return {
            success: true,
            message: 'Review deleted successfully'
        };
    },
    // 5️⃣ Check if user can review
    async canUserReview(productId, userId) {
        const hasReviewed = await reviewRepository_js_1.reviewRepository.userHasReviewed(productId, userId);
        if (hasReviewed) {
            return {
                canReview: false,
                message: 'You have already reviewed this product'
            };
        }
        return {
            canReview: true
        };
    }
};
