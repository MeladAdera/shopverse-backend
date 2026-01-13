"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Product name is required").max(200),
    description: zod_1.z.string().min(1, "Description is required"),
    price: zod_1.z.number().positive("Price must be positive").max(9999999.99, "Price is too high"),
    stock: zod_1.z.number().int().min(0, "Stock cannot be negative"),
    category_id: zod_1.z.number().int().positive("Category is required"),
    image_urls: zod_1.z.array(zod_1.z.string().url("Image URL is invalid")).optional(),
});
exports.updateProductSchema = exports.createProductSchema.partial();
