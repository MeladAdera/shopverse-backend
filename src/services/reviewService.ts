import { reviewRepository } from '../repositories/reviewRepository.js';
import { CreateReviewData, ReviewWithUser, ProductReviewsSummary } from '../models/Review.js';
import { AppError } from '../ errors/AppError.js';

export const reviewService = {
  // 1️⃣ Create new review with condition validation
  async createReview(reviewData: CreateReviewData): Promise<any> {
    const { user_id, product_id, rating } = reviewData;
    // TBD use validation

    // Verify that rating is between 1-5
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5 stars', 400);
    }

    // Verify that user hasn't reviewed this product before
    const hasReviewed = await reviewRepository.userHasReviewed(product_id, user_id);
    if (hasReviewed) {
      throw new AppError('You have already reviewed this product', 400);
    }

    // Create the review
    const review = await reviewRepository.create(reviewData);
    
    return {
      success: true,
      message: 'Review added successfully',
      data: review
    };
  },

  // 2️⃣ Get product reviews
  async getProductReviews(productId: number): Promise<ReviewWithUser[]> {
    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    const reviews = await reviewRepository.getByProductId(productId);
    return reviews;
  },

  // 3️⃣ Get review statistics
  async getProductReviewsSummary(productId: number): Promise<ProductReviewsSummary> {
    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    const summary = await reviewRepository.getSummary(productId);
    return summary;
  },

  // 4️⃣ Delete review (only review owner can delete)
  async deleteReview(reviewId: number, userId: number): Promise<{ success: boolean; message: string }> {
    const deleted = await reviewRepository.delete(reviewId, userId);
    
    if (!deleted) {
      throw new AppError('Review not found or you do not have permission to delete', 404);
    }

    return {
      success: true,
      message: 'Review deleted successfully'
    };
  },

  // 5️⃣ Check if user can review
  async canUserReview(productId: number, userId: number): Promise<{ canReview: boolean; message?: string }> {
    const hasReviewed = await reviewRepository.userHasReviewed(productId, userId);
    
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