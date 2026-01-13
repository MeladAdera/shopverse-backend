"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.testConnection = exports.pool = void 0;
const pg_1 = require("pg");
// إنشاء connection pool
exports.pool = new pg_1.Pool({
    host: 'localhost',
    port: 5432,
    database: 'shopverse',
    user: 'admin', // أو اسم المستخدم الخاص بك
    password: 'admin123', // كلمة المرور الخاصة بك
});
// اختبار الاتصال
const testConnection = async () => {
    try {
        const client = await exports.pool.connect();
        console.log('✅ Connected to PostgreSQL database');
        client.release();
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};
exports.testConnection = testConnection;
// دالة مساعدة للاستعلامات
const query = (text, params) => {
    return exports.pool.query(text, params);
};
exports.query = query;
