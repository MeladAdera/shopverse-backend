import app from './app.js';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { runMigrations } from './database/migrate.js'; // 🆕 Import the update function

// Load environment variables early
dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// 🔄 Enhanced startup function
const startServer = async () => {
  try {
    console.log('🔄 Starting server...');
    
    // 1. Test database connection
    console.log('🔌 Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // 2. Run database updates 🆕
    console.log('📊 Updating database...');
    await runMigrations();

    // 3. Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server started successfully!`);
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Health: http://${HOST}:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
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

export default server;