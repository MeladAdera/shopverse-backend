"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_js_1 = require("./config/database.js");
const migrate_js_1 = require("./database/migrate.js"); // 🆕 Import the update function
// Load environment variables early
dotenv_1.default.config();
const PORT = // @ts-ignore
 process.env.PORT || 5000;
const HOST = // @ts-ignore
 process.env.HOST || 'localhost';
// 🔄 Enhanced startup function
const startServer = async () => {
    try {
        console.log('🔄 Starting server...');
        // 1. Test database connection
        console.log('🔌 Testing database connection...');
        const isConnected = await (0, database_js_1.testConnection)();
        if (!isConnected) {
            throw new Error('Database connection failed');
        }
        // 2. Run database updates 🆕
        console.log('📊 Updating database...');
        await (0, migrate_js_1.runMigrations)();
        // 3. Start server
        const server = app_js_1.default.listen(PORT, () => {
            console.log(`✅ Server started successfully!`);
            console.log(`🚀 Server running on http://${HOST}:${PORT}`);
            console.log(`📊 Health: http://${HOST}:${PORT}/api/health`);
            console.log(`🌍 Environment: ${ // @ts-ignore
            process.env.NODE_ENV || 'development'}`);
        });
        return server;
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
    console.log(`\n📢 Received ${signal}. Shutting down server safely...`);
    process.exit(0);
};
// Error handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled rejection at:', promise, 'Reason:', reason);
    process.exit(1);
});
// 🚀 Start the server
const server = startServer();
exports.default = server;
