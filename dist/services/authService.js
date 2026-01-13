"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const password_js_1 = require("../utils/password.js");
const jwt_js_1 = require("../utils/jwt.js");
const userRepository_js_1 = require("../repositories/userRepository.js");
const errorTypes_js_1 = require("../ errors/errorTypes.js");
/**
 * خدمة المصادقة - الآن تحتوي على business logic فقط
 */
class AuthService {
    /**
     * تسجيل مستخدم جديد
     */
    static async register(userData) {
        const { name, email, password } = userData;
        // 1. التحقق من قوة كلمة المرور ← منطق
        const passwordValidation = (0, password_js_1.validatePasswordStrength)(password);
        if (!passwordValidation.isValid) {
            throw new errorTypes_js_1.ValidationError(passwordValidation.message);
        }
        // 2. التحقق من وجود الإيميل ← Repository
        const emailExists = await userRepository_js_1.userRepository.emailExists(email);
        if (emailExists) {
            throw new errorTypes_js_1.ConflictError('Email already exists');
        }
        // 3. تشفير كلمة المرور ← منطق
        const passwordHash = await (0, password_js_1.hashPassword)(password);
        // 4. إنشاء المستخدم ← Repository
        const newUser = await userRepository_js_1.userRepository.create({
            name,
            email,
            password_hash: passwordHash,
            role: 'user'
        });
        // 5. إنشاء التوكنات ← منطق
        const tokenPayload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name // 🆕 أضفنا name هنا
        };
        const accessToken = (0, jwt_js_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_js_1.generateRefreshToken)(tokenPayload);
        // 6. إرجاع النتيجة النهائية
        return {
            user: newUser, // بالفعل بدون password_hash
            accessToken,
            refreshToken
        };
    }
    /**
     * تسجيل الدخول
     * 🆕 تم تحديثه للتحقق من حالة المستخدم (active)
     */
    static async login(credentials) {
        const { email, password } = credentials;
        // 1. البحث عن المستخدم ← Repository
        const user = await userRepository_js_1.userRepository.findByEmail(email);
        if (!user) {
            throw new errorTypes_js_1.AuthenticationError('Invalid email or password');
        }
        // 🆕 2. التحقق من أن المستخدم نشط (غير معطل)
        if (!user.active) {
            throw new errorTypes_js_1.AuthenticationError('Your account has been blocked. Please contact the administrator to reactivate your account.');
        }
        // 3. التحقق من كلمة المرور ← منطق
        const isPasswordValid = await (0, password_js_1.verifyPassword)(password, user.password_hash);
        if (!isPasswordValid) {
            throw new errorTypes_js_1.AuthenticationError('Invalid email or password');
        }
        // 4. إنشاء التوكنات ← منطق
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name // 🆕 أضفنا name هنا
        };
        const accessToken = (0, jwt_js_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_js_1.generateRefreshToken)(tokenPayload);
        // 5. إرجاع النتيجة النهائية
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            },
            accessToken,
            refreshToken
        };
    }
    /**
     * تجديد التوكن
     * 🆕 تم تحديثه للتحقق من حالة المستخدم (active)
     */
    static async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new errorTypes_js_1.ValidationError('Refresh token is required');
        }
        // 1. التحقق من صحة الـ refresh token ← منطق
        const decoded = (0, jwt_js_1.verifyRefreshToken)(refreshToken);
        // 2. التأكد من وجود المستخدم ← Repository
        const user = await userRepository_js_1.userRepository.findByIdWithPassword(decoded.userId);
        if (!user) {
            throw new errorTypes_js_1.AuthenticationError('User not found');
        }
        // 🆕 3. التحقق من أن المستخدم نشط (غير معطل)
        if (!user.active) {
            throw new errorTypes_js_1.AuthenticationError('Your account has been blocked. Tokens cannot be refreshed.');
        }
        // 4. إنشاء توكنات جديدة ← منطق
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name // 🆕 أضفنا name هنا
        };
        const newAccessToken = (0, jwt_js_1.generateAccessToken)(tokenPayload);
        const newRefreshToken = (0, jwt_js_1.generateRefreshToken)(tokenPayload);
        // 5. إرجاع النتيجة النهائية
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }
    /**
     * الحصول على بيانات المستخدم
     * 🆕 تم تحديثه للتحقق من حالة المستخدم (active)
     */
    static async getProfile(userId) {
        // 1. البحث عن المستخدم ← Repository
        const user = await userRepository_js_1.userRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new errorTypes_js_1.AuthenticationError('User not found');
        }
        // 🆕 2. التحقق من أن المستخدم نشط (غير معطل)
        if (!user.active) {
            throw new errorTypes_js_1.AuthenticationError('Your account has been blocked. Profile access denied.');
        }
        // 3. إرجاع بيانات المستخدم (بدون password_hash و active)
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        };
    }
    /**
    * 🆕 دالة مساعدة للتحقق من حالة المستخدم فقط
    * تم تحديثها لاستخدام getUserStatus لتحسين الأداء
    */
    static async checkUserStatus(userId) {
        const userStatus = await userRepository_js_1.userRepository.getUserStatus(userId);
        if (!userStatus) {
            throw new errorTypes_js_1.AuthenticationError('User not found');
        }
        return userStatus;
    }
}
exports.AuthService = AuthService;
