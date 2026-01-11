// src/routes/productRoutes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

import { uploadProductImages, validateProductImages } from '../config/multer.js'; // ⚠️ تأكد من المسار

const router = Router();

// ============================================
// 🔓 Routes PUBLIC (لا تحتاج مصادقة)
// ============================================

// 1. جلب جميع المنتجات مع الفلترة
router.get('/', ProductController.getProducts);

// 2. البحث المتقدم عن المنتجات
router.post('/advanced-search', ProductController.advancedSearch);

// 3. جلب خيارات الفلترة المتاحة
router.get('/filter-options', ProductController.getFilterOptions);

// 4. جلب المنتجات الأكثر مبيعاً
router.get('/top-selling', ProductController.getTopSelling);

// 5. جلب المنتجات حسب الجنس
router.get('/gender/:gender', ProductController.getProductsByGender);

// 6. جلب المنتجات حسب الموسم
router.get('/season/:season', ProductController.getProductsBySeason);

// 7. جلب المنتجات حسب الماركة
router.get('/brand/:brand', ProductController.getProductsByBrand);

// 8. جلب منتجات حسب التصنيف
router.get('/category/:categoryId', ProductController.getProductsByCategory);

// 9. جلب منتج محدد
router.get('/:id', ProductController.getProduct);

// ============================================
// 🔐 Routes PROTECTED (تحتاج مصادقة مسؤول)
// ============================================

// 1. إنشاء منتج جديد - مع دعم 3 صور
router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadProductImages,      // ⭐ ⭐ ⭐ ⭐ ⭐ uploadProductImages (بالجمع)
  validateProductImages,    // ⭐ ⭐ ⭐ ⭐ ⭐ validateProductImages (بالجمع)
  ProductController.createProduct
);

// 2. تحديث منتج
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  ProductController.updateProduct
);

// 3. تحديث صور المنتج - مع دعم 3 صور
router.patch(
  '/:id/images',
  authenticate,
  requireAdmin,
  uploadProductImages,      // ⭐ ⭐ ⭐ ⭐ ⭐ هنا أيضاً
  validateProductImages,    // ⭐ ⭐ ⭐ ⭐ ⭐ هنا أيضاً
  ProductController.updateProductImages
);

// 4. تحديث مخزون المنتج
router.patch(
  '/:id/stock',
  authenticate,
  requireAdmin,
  ProductController.updateProductStock
);

// 5. 🔥 NEW: تحديث عداد مبيعات المنتج
router.patch(
  '/:id/sales',
  authenticate,
  requireAdmin,
  ProductController.updateSalesCount
);

// 6. حذف منتج (Soft Delete)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  ProductController.deleteProduct
);

// 7. 🔥 NEW: إحصائيات المنتجات (للمسؤول فقط)
router.get(
  '/stats/admin',
  authenticate,
  requireAdmin,
  ProductController.getProductStats
);

export default router;