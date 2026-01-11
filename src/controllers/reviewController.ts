//src/controllers/reviewController.ts
import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/reviewService.js';
import { ResponseHelper } from '../utils/responseHelper.js';
import { 
  catchAsync, 
  ValidationError, 
} from '../ errors/errorTypes.js';

export const reviewController = {
  // 1️⃣ Create new review - using catchAsync
createReview: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 🔥 GET product_id from URL params (الصحيح)
  const { productId } = req.params;
  const { rating, comment } = req.body;
  
  // 🔥 GET user_id from token (الآمن)
  const user_id = req.user?.id;

  console.log('📝 بيانات إنشاء التقييم:', {
    product_id: productId,    // من URL
    user_id,                 // من token
    rating,                  // من body
    comment                  // من body
  });

  // Validate required data
  if (!productId || !rating || !user_id) {
    throw new ValidationError('Review data is incomplete', {
      missing_fields: {
        product_id: !productId,
        rating: !rating, 
        user_id: !user_id
      }
    });
  }

  // Convert productId to number
  const product_id = parseInt(productId);
  
  if (isNaN(product_id)) {
    throw new ValidationError('Invalid product ID', {
      product_id: productId
    });
  }

  const result = await reviewService.createReview({
    user_id,
    product_id,
    rating: Number(rating),
    comment: comment || ''
  });

  ResponseHelper.success(res, result.message, result.data, 201);
}),

  // 2️⃣ Get reviews for a specific product - using catchAsync
  getProductReviews: catchAsync(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId);
    
    if (!productId) {
      throw new ValidationError('Product ID is required');
    }

    const reviews = await reviewService.getProductReviews(productId);
    ResponseHelper.success(res, 'Reviews retrieved successfully', reviews);
  }),

  // 3️⃣ Get review statistics for a product - using catchAsync
  getProductReviewsSummary: catchAsync(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId);
    
    if (!productId) {
      throw new ValidationError('Product ID is required');
    }

    const summary = await reviewService.getProductReviewsSummary(productId);
    ResponseHelper.success(res, 'Review statistics retrieved successfully', summary);
  }),

  // 4️⃣ Delete review - using catchAsync
  deleteReview: catchAsync(async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.reviewId);
    const user_id = req.user?.id;

    if (!reviewId || !user_id) {
      throw new ValidationError('Incomplete data');
    }

    const result = await reviewService.deleteReview(reviewId, user_id);
    ResponseHelper.success(res, result.message);
  }),

  // 5️⃣ Check if user can review - using catchAsync
  checkCanReview: catchAsync(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId);
    const user_id = req.user?.id; // ⭐ Fixed from email to id

    if (!productId || !user_id) {
      throw new ValidationError('Incomplete data');
    }

    const result = await reviewService.canUserReview(productId, user_id);
    ResponseHelper.success(res, 'Verification successful', result);
  })
};