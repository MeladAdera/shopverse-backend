"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/productRoutes.ts
const express_1 = require("express");
const productController_js_1 = require("../controllers/productController.js");
const auth_js_1 = require("../middleware/auth.js");
const multer_js_1 = require("../config/multer.js"); // ⚠️ تأكد من المسار
const router = (0, express_1.Router)();
// ============================================
// 🔓 Routes PUBLIC (لا تحتاج مصادقة)
// ============================================
// 1. جلب جميع المنتجات مع الفلترة
router.get('/', productController_js_1.ProductController.getProducts);
// 2. البحث المتقدم عن المنتجات
router.post('/advanced-search', productController_js_1.ProductController.advancedSearch);
// 3. جلب خيارات الفلترة المتاحة
router.get('/filter-options', productController_js_1.ProductController.getFilterOptions);
// 4. جلب المنتجات الأكثر مبيعاً
router.get('/top-selling', productController_js_1.ProductController.getTopSelling);
// 5. جلب المنتجات حسب الجنس
router.get('/gender/:gender', productController_js_1.ProductController.getProductsByGender);
// 6. جلب المنتجات حسب الموسم
router.get('/season/:season', productController_js_1.ProductController.getProductsBySeason);
// 7. جلب المنتجات حسب الماركة
router.get('/brand/:brand', productController_js_1.ProductController.getProductsByBrand);
// 8. جلب منتجات حسب التصنيف
router.get('/category/:categoryId', productController_js_1.ProductController.getProductsByCategory);
// 9. جلب منتج محدد
router.get('/:id', productController_js_1.ProductController.getProduct);
// ============================================
// 🔐 Routes PROTECTED (تحتاج مصادقة مسؤول)
// ============================================
// 1. إنشاء منتج جديد - مع دعم 3 صور
router.post('/', auth_js_1.authenticate, auth_js_1.requireAdmin, multer_js_1.uploadProductImages, // ⭐ ⭐ ⭐ ⭐ ⭐ uploadProductImages (بالجمع)
multer_js_1.validateProductImages, // ⭐ ⭐ ⭐ ⭐ ⭐ validateProductImages (بالجمع)
productController_js_1.ProductController.createProduct);
// 2. تحديث منتج
router.put('/:id', auth_js_1.authenticate, auth_js_1.requireAdmin, productController_js_1.ProductController.updateProduct);
// 3. تحديث صور المنتج - مع دعم 3 صور
router.patch('/:id/images', auth_js_1.authenticate, auth_js_1.requireAdmin, multer_js_1.uploadProductImages, // ⭐ ⭐ ⭐ ⭐ ⭐ هنا أيضاً
multer_js_1.validateProductImages, // ⭐ ⭐ ⭐ ⭐ ⭐ هنا أيضاً
productController_js_1.ProductController.updateProductImages);
// 4. تحديث مخزون المنتج
router.patch('/:id/stock', auth_js_1.authenticate, auth_js_1.requireAdmin, productController_js_1.ProductController.updateProductStock);
// 5. 🔥 NEW: تحديث عداد مبيعات المنتج
router.patch('/:id/sales', auth_js_1.authenticate, auth_js_1.requireAdmin, productController_js_1.ProductController.updateSalesCount);
// 6. حذف منتج (Soft Delete)
router.delete('/:id', auth_js_1.authenticate, auth_js_1.requireAdmin, productController_js_1.ProductController.deleteProduct);
// 7. 🔥 NEW: إحصائيات المنتجات (للمسؤول فقط)
router.get('/stats/admin', auth_js_1.authenticate, auth_js_1.requireAdmin, productController_js_1.ProductController.getProductStats);
exports.default = router;
