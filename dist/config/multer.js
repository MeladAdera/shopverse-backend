"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticFilesConfig = exports.deleteImages = exports.deleteImageByUrl = exports.deleteFile = exports.validateImageUpload = exports.uploadProductImage = exports.getImageUrl = exports.getImageUrls = exports.validateProductImages = exports.uploadProductImages = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errorTypes_js_1 = require("../ errors/errorTypes.js");
const process = __importStar(require("process"));
// 1. إنشاء مجلدات التحميل إذا لم تكن موجودة
const createUploadsFolders = () => {
    const folders = [
        'public/products',
        'public/temp',
        'public/avatars',
        'public/categories'
    ];
    folders.forEach(folder => {
        if (!fs_1.default.existsSync(folder)) {
            fs_1.default.mkdirSync(folder, { recursive: true });
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
            const fileExt = path_1.default.extname(file.originalname);
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
// ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐
// ⭐ الحل الجديد: Multer متعدد الصور ⭐
// ============================================
// 5. ⭐ MIDDLEWARE لرفع حتى 3 صور (للصور المتعددة)
exports.uploadProductImages = (0, multer_1.default)({
    storage: productStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB لكل صورة
    }
}).array('images', 3); // ⭐ 'images' (جمع) - حتى 3 ملفات
// 6. ⭐ MIDDLEWARE للتحقق من الصور المتعددة
const validateProductImages = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        throw new errorTypes_js_1.ValidationError('يجب رفع صورة واحدة على الأقل للمنتج');
    }
    const files = req.files;
    if (files.length > 3) {
        throw new errorTypes_js_1.ValidationError('لا يمكن رفع أكثر من 3 صور للمنتج الواحد');
    }
    // تحديث هنا لاستخدام /public/products/
    files.forEach((file) => {
        file.publicUrl = `/public/products/${file.filename}`; // ✅ التحديث هنا
    });
    next();
};
exports.validateProductImages = validateProductImages;
// 7. ⭐ دالة للحصول على روابط متعددة للصور
const getImageUrls = (files) => {
    if (!files || files.length === 0)
        return [];
    return files.map(file => file.publicUrl || `/public/products/${file.filename}` // ✅ تحديث هنا أيضًا
    );
};
exports.getImageUrls = getImageUrls;
// 8. دالة للحصول على رابط صورة واحدة
const getImageUrl = (filename) => {
    return `/public/products/${filename}`; // ✅ إضافة /public/
};
exports.getImageUrl = getImageUrl;
// 9. ⭐ للتوافق: MIDDLEWARE لصورة واحدة فقط (للرجعية)
exports.uploadProductImage = (0, multer_1.default)({
    storage: productStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
}).single('image'); // 'image' (مفرد) - للتوافق
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
            fullPath = path_1.default.join('public', filePath);
        }
        const absolutePath = path_1.default.isAbsolute(fullPath)
            ? fullPath
            : path_1.default.join(process.cwd(), fullPath);
        fs_1.default.unlink(absolutePath, (error) => {
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
    const filename = path_1.default.basename(imageUrl);
    const filePath = path_1.default.join('public/products', filename);
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
    uploadProductImages: exports.uploadProductImages, // ⭐ الرئيسي: لرفع 3 صور
    validateProductImages: // ⭐ الرئيسي: لرفع 3 صور
    exports.validateProductImages, // ⭐ الرئيسي: للتحقق من 3 صور
    uploadProductImage: // ⭐ الرئيسي: للتحقق من 3 صور
    exports.uploadProductImage, // ⭐ للتوافق: لصورة واحدة
    validateImageUpload: // ⭐ للتوافق: لصورة واحدة
    exports.validateImageUpload, // ⭐ للتوافق: للتحقق من صورة واحدة
    getImageUrl: // ⭐ للتوافق: للتحقق من صورة واحدة
    exports.getImageUrl,
    getImageUrls: exports.getImageUrls, // ⭐ للحصول على روابط متعددة
    deleteFile: // ⭐ للحصول على روابط متعددة
    exports.deleteFile,
    deleteImageByUrl: exports.deleteImageByUrl,
    deleteImages: exports.deleteImages, // ⭐ لحذف مجموعة صور
    allowedMimeTypes,
    staticFilesConfig: exports.staticFilesConfig
};
