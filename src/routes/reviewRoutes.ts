//src/routes/reviewRoutes.ts
import { Router } from 'express';
import { reviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';


const router = Router();

// ✅ مسارات التقييمات
router.post('/products/:productId/reviews',authenticate, reviewController.createReview);
router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.get('/products/:productId/reviews/summary', reviewController.getProductReviewsSummary);
router.delete('/reviews/:reviewId', authenticate ,reviewController.deleteReview);
router.get('/products/:productId/can-review', reviewController.checkCanReview);

export default router; 