"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//src/routes/reviewRoutes.ts
const express_1 = require("express");
const reviewController_js_1 = require("../controllers/reviewController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// ✅ مسارات التقييمات
router.post('/products/:productId/reviews', auth_js_1.authenticate, reviewController_js_1.reviewController.createReview);
router.get('/products/:productId/reviews', reviewController_js_1.reviewController.getProductReviews);
router.get('/products/:productId/reviews/summary', reviewController_js_1.reviewController.getProductReviewsSummary);
router.delete('/reviews/:reviewId', auth_js_1.authenticate, reviewController_js_1.reviewController.deleteReview);
router.get('/products/:productId/can-review', reviewController_js_1.reviewController.checkCanReview);
exports.default = router;
