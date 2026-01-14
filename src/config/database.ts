// src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
// import dns from 'dns';

// ⭐ حل مشكلة DNS
// dns.setDefaultResultOrder('ipv4first');

dotenv.config();

console.log('🎯 Connecting to NEW PostgreSQL database...');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL missing from .env file');
  console.log('📋 Current .env content:');
  console.log(process.env);
  process.exit(1);
}

// تحليل الـ URL لعرض معلومات مفيدة
try {
  const dbUrl = new URL(connectionString.replace('postgresql://', 'http://'));
  console.log('📍 Host:', dbUrl.hostname);
  console.log('👤 Username:', dbUrl.username);
  console.log('🗄️ Database:', dbUrl.pathname.replace('/', ''));
  console.log('🔐 SSL: Enabled (Render requirement)');
} catch (e) {
  console.log('📡 Using connection string');
}

// ⭐ إعدادات Pool محسنة
export const pool = new Pool({
  connectionString: connectionString,
  // ⭐ SSL مطلوب لـ Render
  ssl: {
    rejectUnauthorized: false,
  },
  // إعدادات الاتصال
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // 15 ثانية
});

// ⭐ دالة اتصال ذكية
export const testConnection = async (): Promise<boolean> => {
  console.log('🔗 Testing connection to new database...');
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`🔄 Attempt ${attempt}/3`);
    
    try {
      const client = await pool.connect();
      console.log('✅ SUCCESS! Connected to new database');
      
      // اختبارات أساسية
      const tests = [
        { query: 'SELECT version()', label: 'PostgreSQL Version' },
        { query: 'SELECT current_database()', label: 'Current Database' },
        { query: 'SELECT current_user', label: 'Current User' },
        { query: 'SELECT NOW()', label: 'Server Time' }
      ];
      
      for (const test of tests) {
        const result = await client.query(test.query);
        console.log(`📊 ${test.label}:`, result.rows[0]);
      }
      
      client.release();
      return true;
      
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
            console.error("melad", error);


      
      // تحليل الخطأ
      if (error.code === 'ETIMEDOUT') {
        console.log('⏱️ Timeout - checking network/firewall');
      } else if (error.code === 'ENOTFOUND') {
        console.log('🌐 DNS error - hostname not found');
        console.log('💡 Check if database is active on Render');
      } else if (error.message.includes('password')) {
        console.log('🔑 Authentication failed - check credentials');
      }
      
      if (attempt < 3) {
        console.log('⏳ Waiting 3 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  console.log('💀 All connection attempts failed');
  console.log('🛠️ Please verify:');
  console.log('1. Database is ACTIVE on Render dashboard');
  console.log('2. DATABASE_URL is correct in .env file');
  console.log('3. Internet connection is stable');
  console.log('4. No firewall blocking port 5432');
  
  return false;
};

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};