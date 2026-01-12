import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// Import new configurations
import { corsOptions } from './config/cors.js';
import { limiter } from './config/rateLimit.js';
import { env } from './config/env.js';
// Import new error system
import { errorHandler, notFoundHandler } from './ errors/errorHandler.js';
// Import Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
const app = express();
// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));
// CORS Configuration
app.use(cors(corsOptions));
// في app.js في الباك إند، قبل express.static
app.use('/public', (req, res, next) => {
    // أضف هذه الـ headers للصور
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    next();
}, express.static('public'));
app.use('/products', express.static('public/products'));
// Rate Limiting - varies by environment
app.use('/api/', env.NODE_ENV === 'production' ? limiter : (req, res, next) => next());
// Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Logging based on environment
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🛍️ Shopverse Backend is running!',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        version: '1.0.0'
    });
});
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Shopverse API',
        version: '1.0.0',
        documentation: '/api/docs'
    });
});
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
// 404 Handler - using new system
app.use(notFoundHandler);
// Global Error Handler - using new system
app.use(errorHandler);
export default app;
