// 📁 src/routes/orderRoutes.ts
import express from 'express';
import { orderController } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 🛒 جميع routes تتطلب مصادقة
router.use(authenticate);

// 🎯 إنشاء طلب جديد من الكارت
router.post('/checkout', orderController.checkout);

// 🎯 جلب طلبات المستخدم
router.get('/', orderController.getOrders);

// 🎯 جلب طلب معين
router.get('/:id', orderController.getOrderById);

// 🎯 إلغاء طلب
router.put('/:id/cancel', orderController.cancelOrder);

export default router;