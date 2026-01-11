// 📁 src/routes/adminRoutes.ts
import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { adminGuard } from '../middleware/admin'; // 🆕 سننشئ هذا

const router = Router();

router.get('/categories', adminController.getCategories);

// 🔐 جميع routes تتطلب مصادقة وتحقق من صلاحيات Admin
router.use(authenticate);
router.use(adminGuard);

// 👥 إدارة المستخدمين
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/dashboard/stats', adminController.getDashboardStats); 
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id/status', adminController.updateOrderStatus);
// 🆕 إدارة التصنيفات
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

export default router;