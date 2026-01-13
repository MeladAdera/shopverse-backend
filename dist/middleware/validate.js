"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSchemas = exports.validateRequest = void 0;
const zod_1 = require("zod");
const errorTypes_js_1 = require("../ errors/errorTypes.js");
/**
 * middleware للتحقق من صحة البيانات باستخدام Zod
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const data = {
                body: req.body,
                query: req.query,
                params: req.params,
            };
            const result = schema.parse(data);
            req.body = result.body || {};
            req.query = result.query || {};
            req.params = result.params || {};
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                next(new errorTypes_js_1.ValidationError('Validation failed', details));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
/**
 * schemas جاهزة للاستخدام
 */
exports.authSchemas = {
    login: zod_1.z.object({
        body: zod_1.z.object({
            email: zod_1.z.string().email('Invalid email format'),
            password: zod_1.z.string().min(1, 'Password is required'),
        }),
    }),
    register: zod_1.z.object({
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
            email: zod_1.z.string().email('Invalid email format'),
            password: zod_1.z.string().min(8, 'Password must be at least 8 characters')
                .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
                .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
                .regex(/\d/, 'Password must contain at least one number'),
        }),
    }),
};
