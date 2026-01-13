"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 📁 src/routes/cartRoutes.ts
const express_1 = __importDefault(require("express"));
const cartController_js_1 = require("../controllers/cartController.js");
const auth_js_1 = require("../middleware/auth.js"); // ⬅️ استخدم authenticate مباشرة
const router = express_1.default.Router();
// 🛒 استخدم authenticate مباشرة على كل route بدلاً من router.use
router.get('/', auth_js_1.authenticate, cartController_js_1.cartController.getCart);
router.post('/items', auth_js_1.authenticate, cartController_js_1.cartController.addToCart);
router.put('/items/:itemId', auth_js_1.authenticate, cartController_js_1.cartController.updateCartItem);
router.delete('/items/:itemId', auth_js_1.authenticate, cartController_js_1.cartController.removeFromCart);
router.delete('/clear', auth_js_1.authenticate, cartController_js_1.cartController.clearCart);
router.get('/count', auth_js_1.authenticate, cartController_js_1.cartController.getCartItemsCount);
exports.default = router;
