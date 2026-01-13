"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 📁 src/routes/adminRoutes.ts
const express_1 = require("express");
const adminController_js_1 = require("../controllers/adminController.js");
const auth_js_1 = require("../middleware/auth.js");
const admin_js_1 = require("../middleware/admin.js"); // 🆕 سننشئ هذا
const router = (0, express_1.Router)();
router.get('/categories', adminController_js_1.adminController.getCategories);
// 🔐 جميع routes تتطلب مصادقة وتحقق من صلاحيات Admin
router.use(auth_js_1.authenticate);
router.use(admin_js_1.adminGuard);
// 👥 إدارة المستخدمين
router.get('/users', adminController_js_1.adminController.getUsers);
router.get('/users/:id', adminController_js_1.adminController.getUserById);
router.put('/users/:id/status', adminController_js_1.adminController.updateUserStatus);
router.get('/dashboard/stats', adminController_js_1.adminController.getDashboardStats);
router.get('/orders', adminController_js_1.adminController.getOrders);
router.get('/orders/:id', adminController_js_1.adminController.getOrderById);
router.put('/orders/:id/status', adminController_js_1.adminController.updateOrderStatus);
// 🆕 إدارة التصنيفات
router.post('/categories', adminController_js_1.adminController.createCategory);
router.put('/categories/:id', adminController_js_1.adminController.updateCategory);
router.delete('/categories/:id', adminController_js_1.adminController.deleteCategory);
exports.default = router;
