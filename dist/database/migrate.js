"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.runMigrations = void 0;
// src/database/migrate.ts
const database_js_1 = require("../config/database.js");
const runMigrations = async () => {
    try {
        console.log('🔄 Initializing database...');
        // ⭐ أولاً: إنشاء الجداول إذا لم تكن موجودة
        const createTables = [
            // جدول users
            `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
            // جدول categories
            `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
            // جدول products
            `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        category_id INTEGER REFERENCES categories(id),
        images TEXT[],
        active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
            // ⭐ جدول orders (الذي كان مفقوداً)
            `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address TEXT,
        payment_method VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
            // جدول order_items
            `CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL
      )`,
            // جدول cart_items
            `CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
            // جدول reviews
            `CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
        ];
        // إنشاء الجداول
        console.log('📦 Creating database tables...');
        for (const [index, sql] of createTables.entries()) {
            console.log(`📝 Creating table ${index + 1}/${createTables.length}...`);
            await (0, database_js_1.query)(sql);
        }
        console.log('✅ Tables created successfully!');
        // ⭐ ثانياً: التحديثات (migrations)
        console.log('🔄 Applying updates to existing tables...');
        const updates = [
            // 1. Add sales_count to products (إذا لم تكن موجودة)
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0`,
            // 2. Update sales_count based on existing orders (إذا كان هناك بيانات)
            `UPDATE products SET sales_count = COALESCE((
        SELECT SUM(oi.quantity) 
        FROM order_items oi 
        WHERE oi.product_id = products.id
      ), 0) WHERE EXISTS (SELECT 1 FROM order_items)`
        ];
        // تطبيق التحديثات
        for (const [index, sql] of updates.entries()) {
            console.log(`📝 Applying update ${index + 1}/${updates.length}...`);
            try {
                await (0, database_js_1.query)(sql);
            }
            catch (error) {
                console.log(`⚠️ Update ${index + 1} skipped (may not apply):`, error.message);
            }
        }
        console.log('✅ Database initialization completed successfully!');
    }
    catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
};
exports.runMigrations = runMigrations;
// Also export the testConnection function if it doesn't exist
var database_js_2 = require("../config/database.js");
Object.defineProperty(exports, "testConnection", { enumerable: true, get: function () { return database_js_2.testConnection; } });
