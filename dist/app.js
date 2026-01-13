"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Import new configurations
const cors_js_1 = require("./config/cors.js");
const rateLimit_js_1 = require("./config/rateLimit.js");
const env_js_1 = require("./config/env.js");
// Import new error system
const errorHandler_js_1 = require("./ errors/errorHandler.js");
// Import Routes
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const productRoutes_js_1 = __importDefault(require("./routes/productRoutes.js"));
const reviewRoutes_js_1 = __importDefault(require("./routes/reviewRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const cartRoutes_js_1 = __importDefault(require("./routes/cartRoutes.js"));
const orderRoutes_js_1 = __importDefault(require("./routes/orderRoutes.js"));
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)(cors_js_1.corsOptions));
// في app.js في الباك إند، قبل express.static
app.use('/public', (req, res, next) => {
    // أضف هذه الـ headers للصور
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    next();
}, express_1.default.static('public'));
app.use('/products', express_1.default.static('public/products'));
// Rate Limiting - varies by environment
app.use('/api/', env_js_1.env.NODE_ENV === 'production' ? rateLimit_js_1.limiter : (req, res, next) => next());
// Body parsing with limits
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging based on environment
app.use((0, morgan_1.default)(env_js_1.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🛍️ Shopverse Backend is running!',
        timestamp: new Date().toISOString(),
        environment: env_js_1.env.NODE_ENV,
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
app.use('/api/auth', authRoutes_js_1.default);
app.use('/api/products', productRoutes_js_1.default);
app.use('/api', reviewRoutes_js_1.default);
app.use('/api/admin', adminRoutes_js_1.default);
app.use('/api/cart', cartRoutes_js_1.default);
app.use('/api/orders', orderRoutes_js_1.default);
// 404 Handler - using new system
app.use(errorHandler_js_1.notFoundHandler);
// Global Error Handler - using new system
app.use(errorHandler_js_1.errorHandler);
exports.default = app;
