// src/config/database.ts
import { Pool } from 'pg';

// تعريف process (لأنه global في Node.js)
declare const process: {
  env: {
    DATABASE_URL?: string;
    NODE_ENV?: string;
  };
};

// ⭐ استخدم DATABASE_URL من Environment Variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in environment variables');
}

// إنشاء connection pool
export const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false
  } : false
});

// اختبار الاتصال
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // اختبر query بسيطة للتأكد
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Connection string used:', 
      connectionString ? 
      connectionString.replace(/:[^:@]+@/, ':****@') : 
      'No DATABASE_URL'
    );
    return false;
  }
};

// دالة مساعدة للاستعلامات
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};