"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticFilesConfig = exports.deleteImages = exports.deleteImageByUrl = exports.deleteFile = exports.validateImageUpload = exports.uploadProductImage = exports.getImageUrl = exports.getImageUrls = exports.validateProductImages = exports.uploadProductImages = void 0;
// src/config/multer.ts
const multer_1 = __importDefault(require("multer"));
const errorTypes_js_1 = require("../ errors/errorTypes.js");
// استخدام require مع ignore لتفادي مشاكل TypeScript
// @ts-ignore
const path = require('path');
// @ts-ignore  
const fs = require('fs');
// 1. إنشاء مجلدات التحميل إذا لم تكن موجودة
const createUploadsFolders = () => {
    const folders = [
        'public/products',
        'public/temp',
        'public/avatars',
        'public/categories'
    ];
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
            console.log(`✅ Created folder: ${folder}`);
        }
    });
};
// تنفيذ فوري عند تحميل الملف
createUploadsFolders();
// 2. أنواع الملفات المسموحة
const allowedMimeTypes = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
};
// 3. تصفية الملفات - التحقق من النوع
const fileFilter = (req, file, cb) => {
    try {
        if (allowedMimeTypes[file.mimetype]) {
            cb(null, true);
        }
        else {
            cb(new errorTypes_js_1.ValidationError(`نوع الملف غير مسموح. المسموح: ${Object.keys(allowedMimeTypes).join(', ')}`));
        }
    }
    catch (error) {
        cb(error);
    }
};
// 4. إعداد التخزين للمنتجات
const productStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/products/');
    },
    filename: (req, file, cb) => {
        try {
            const fileExt = path.extname(file.originalname);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const finalName = `product-${uniqueSuffix}${fileExt}`;
            cb(null, finalName);
        }
        catch (error) {
            cb(error, '');
        }
    }
});
// ============================================
// ⭐ MIDDLEWARE لرفع حتى 3 صور (للصور المتعددة)
// ============================================
// 5. ⭐ MIDDLEWARE لرفع حتى 3 صور
exports.uploadProductImages = (0, multer_1.default)({
    storage: productStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB لكل صورة
    }
}).array('images', 3);
// 6. ⭐ MIDDLEWARE للتحقق من الصور المتعددة
const validateProductImages = (req, res, next) => {
    const files = req.files;
    if (!files || files.length === 0) {
        throw new errorTypes_js_1.ValidationError('يجب رفع صورة واحدة على الأقل للمنتج');
    }
    if (files.length > 3) {
        throw new errorTypes_js_1.ValidationError('لا يمكن رفع أكثر من 3 صور للمنتج الواحد');
    }
    files.forEach((file) => {
        file.publicUrl = `/public/products/${file.filename}`;
    });
    next();
};
exports.validateProductImages = validateProductImages;
// 7. ⭐ دالة للحصول على روابط متعددة للصور
const getImageUrls = (files) => {
    if (!files || files.length === 0)
        return [];
    return files.map(file => file.publicUrl || `/public/products/${file.filename}`);
};
exports.getImageUrls = getImageUrls;
// 8. دالة للحصول على رابط صورة واحدة
const getImageUrl = (filename) => {
    return `/public/products/${filename}`;
};
exports.getImageUrl = getImageUrl;
// 9. ⭐ للتوافق: MIDDLEWARE لصورة واحدة فقط
exports.uploadProductImage = (0, multer_1.default)({
    storage: productStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
}).single('image');
// 10. ⭐ للتوافق: التحقق من صورة واحدة
const validateImageUpload = (req, res, next) => {
    if (!req.file) {
        throw new errorTypes_js_1.ValidationError('صورة المنتج مطلوبة');
    }
    if (req.file.filename) {
        req.file.publicUrl = (0, exports.getImageUrl)(req.file.filename);
    }
    next();
};
exports.validateImageUpload = validateImageUpload;
// 11. دالة مساعدة لحذف الملفات
const deleteFile = (filePath) => {
    return new Promise((resolve) => {
        let fullPath = filePath;
        if (filePath.startsWith('/products/') || filePath.startsWith('products/')) {
            fullPath = path.join('public', filePath);
        }
        // @ts-ignore
        const absolutePath = path.isAbsolute(fullPath)
            ? fullPath
            // @ts-ignore
            : path.join(process.cwd(), fullPath);
        fs.unlink(absolutePath, (error) => {
            if (error) {
                console.error(`❌ Failed to delete file: ${absolutePath}`, error);
                resolve(false);
            }
            else {
                console.log(`✅ Deleted file: ${absolutePath}`);
                resolve(true);
            }
        });
    });
};
exports.deleteFile = deleteFile;
// 12. دالة مساعدة لحذف الصورة بناءً على الـ URL
const deleteImageByUrl = (imageUrl) => {
    const filename = path.basename(imageUrl);
    const filePath = path.join('public/products', filename);
    return (0, exports.deleteFile)(filePath);
};
exports.deleteImageByUrl = deleteImageByUrl;
// 13. ⭐ دالة لحذف مجموعة من الصور
const deleteImages = (imageUrls) => {
    const deletePromises = imageUrls.map(url => (0, exports.deleteImageByUrl)(url));
    return Promise.all(deletePromises);
};
exports.deleteImages = deleteImages;
// 15. إعدادات الـ Express لتقديم الملفات الثابتة
exports.staticFilesConfig = {
    publicPath: 'public',
    productsPath: 'public/products'
};
exports.default = {
    uploadProductImages: exports.uploadProductImages,
    validateProductImages: exports.validateProductImages,
    uploadProductImage: exports.uploadProductImage,
    validateImageUpload: exports.validateImageUpload,
    getImageUrl: exports.getImageUrl,
    getImageUrls: exports.getImageUrls,
    deleteFile: exports.deleteFile,
    deleteImageByUrl: exports.deleteImageByUrl,
    deleteImages: exports.deleteImages,
    allowedMimeTypes,
    staticFilesConfig: exports.staticFilesConfig
};
