// 📁 src/routes/cartRoutes.ts
import express from 'express';
import { cartController } from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js'; // ⬅️ استخدم authenticate مباشرة
const router = express.Router();
// 🛒 استخدم authenticate مباشرة على كل route بدلاً من router.use
router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, cartController.addToCart);
router.put('/items/:itemId', authenticate, cartController.updateCartItem);
router.delete('/items/:itemId', authenticate, cartController.removeFromCart);
router.delete('/clear', authenticate, cartController.clearCart);
router.get('/count', authenticate, cartController.getCartItemsCount);
export default router;
