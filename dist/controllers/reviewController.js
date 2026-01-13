"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewController = void 0;
const reviewService_js_1 = require("../services/reviewService.js");
const responseHelper_js_1 = require("../utils/responseHelper.js");
const errorTypes_js_1 = require("../ errors/errorTypes.js");
exports.reviewController = {
    // 1️⃣ Create new review - using catchAsync
    createReview: (0, errorTypes_js_1.catchAsync)(async (req, res, next) => {
        // 🔥 GET product_id from URL params (الصحيح)
        const { productId } = req.params;
        const { rating, comment } = req.body;
        // 🔥 GET user_id from token (الآمن)
        const user_id = req.user?.id;
        console.log('📝 بيانات إنشاء التقييم:', {
            product_id: productId, // من URL
            user_id, // من token
            rating, // من body
            comment // من body
        });
        // Validate required data
        if (!productId || !rating || !user_id) {
            throw new errorTypes_js_1.ValidationError('Review data is incomplete', {
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
            throw new errorTypes_js_1.ValidationError('Invalid product ID', {
                product_id: productId
            });
        }
        const result = await reviewService_js_1.reviewService.createReview({
            user_id,
            product_id,
            rating: Number(rating),
            comment: comment || ''
        });
        responseHelper_js_1.ResponseHelper.success(res, result.message, result.data, 201);
    }),
    // 2️⃣ Get reviews for a specific product - using catchAsync
    getProductReviews: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const productId = parseInt(req.params.productId);
        if (!productId) {
            throw new errorTypes_js_1.ValidationError('Product ID is required');
        }
        const reviews = await reviewService_js_1.reviewService.getProductReviews(productId);
        responseHelper_js_1.ResponseHelper.success(res, 'Reviews retrieved successfully', reviews);
    }),
    // 3️⃣ Get review statistics for a product - using catchAsync
    getProductReviewsSummary: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const productId = parseInt(req.params.productId);
        if (!productId) {
            throw new errorTypes_js_1.ValidationError('Product ID is required');
        }
        const summary = await reviewService_js_1.reviewService.getProductReviewsSummary(productId);
        responseHelper_js_1.ResponseHelper.success(res, 'Review statistics retrieved successfully', summary);
    }),
    // 4️⃣ Delete review - using catchAsync
    deleteReview: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const reviewId = parseInt(req.params.reviewId);
        const user_id = req.user?.id;
        if (!reviewId || !user_id) {
            throw new errorTypes_js_1.ValidationError('Incomplete data');
        }
        const result = await reviewService_js_1.reviewService.deleteReview(reviewId, user_id);
        responseHelper_js_1.ResponseHelper.success(res, result.message);
    }),
    // 5️⃣ Check if user can review - using catchAsync
    checkCanReview: (0, errorTypes_js_1.catchAsync)(async (req, res) => {
        const productId = parseInt(req.params.productId);
        const user_id = req.user?.id; // ⭐ Fixed from email to id
        if (!productId || !user_id) {
            throw new errorTypes_js_1.ValidationError('Incomplete data');
        }
        const result = await reviewService_js_1.reviewService.canUserReview(productId, user_id);
        responseHelper_js_1.ResponseHelper.success(res, 'Verification successful', result);
    })
};
