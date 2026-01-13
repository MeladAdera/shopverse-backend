"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
// src/config/env.ts - نسخة أكثر مرونة
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    // Server
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5000'),
    HOST: zod_1.z.string().default('localhost'),
    // Frontend
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:5173'),
    // JWT Secrets - جعلها optional للتطوير مع قيم افتراضية
    JWT_SECRET: zod_1.z.string().default('fallback-dev-jwt-secret-change-in-production'),
    JWT_REFRESH_SECRET: zod_1.z.string().default('fallback-dev-refresh-secret-change-in-production'),
    // Database (سيتم إضافتها لاحقاً)
    DATABASE_URL: zod_1.z.string().optional(),
});
exports.env = envSchema.parse(// @ts-ignore
process.env);
