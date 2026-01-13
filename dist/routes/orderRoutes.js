"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 📁 src/routes/orderRoutes.ts
const express_1 = __importDefault(require("express"));
const orderController_js_1 = require("../controllers/orderController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
// 🛒 جميع routes تتطلب مصادقة
router.use(auth_js_1.authenticate);
// 🎯 إنشاء طلب جديد من الكارت
router.post('/checkout', orderController_js_1.orderController.checkout);
// 🎯 جلب طلبات المستخدم
router.get('/', orderController_js_1.orderController.getOrders);
// 🎯 جلب طلب معين
router.get('/:id', orderController_js_1.orderController.getOrderById);
// 🎯 إلغاء طلب
router.put('/:id/cancel', orderController_js_1.orderController.cancelOrder);
exports.default = router;
