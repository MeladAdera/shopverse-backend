// ملف تعريفات عامة
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      // أضف متغيرات بيئية أخرى هنا
    }
  }
}

export {};
