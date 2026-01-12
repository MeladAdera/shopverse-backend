import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ValidationError } from '../ errors/errorTypes.js';
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
            cb(new ValidationError(`نوع الملف غير مسموح. المسموح: ${Object.keys(allowedMimeTypes).join(', ')}`));
        }
    }
    catch (error) {
        cb(error);
    }
};
// 4. إعداد التخزين للمنتجات
const productStorage = multer.diskStorage({
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
// ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐
// ⭐ الحل الجديد: Multer متعدد الصور ⭐
// ============================================
// 5. ⭐ MIDDLEWARE لرفع حتى 3 صور (للصور المتعددة)
export const uploadProductImages = multer({
    storage: productStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB لكل صورة
    }
}).array('images', 3); // ⭐ 'images' (جمع) - حتى 3 ملفات
// 6. ⭐ MIDDLEWARE للتحقق من الصور المتعددة
export const validateProductImages = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        throw new ValidationError('يجب رفع صورة واحدة على الأقل للمنتج');
    }
    const files = req.files;
    if (files.length > 3) {
        throw new ValidationError('لا يمكن رفع أكثر من 3 صور للمنتج الواحد');
    }
    // تحديث هنا لاستخدام /public/products/
    files.forEach((file) => {
        file.publicUrl = `/public/products/${file.filename}`; // ✅ التحديث هنا
    });
    next();
};
// 7. ⭐ دالة للحصول على روابط متعددة للصور
export const getImageUrls = (files) => {
    if (!files || files.length === 0)
        return [];
    return files.map(file => file.publicUrl || `/public/products/${file.filename}` // ✅ تحديث هنا أيضًا
    );
};
// 8. دالة للحصول على رابط صورة واحدة
export const getImageUrl = (filename) => {
    return `/public/products/${filename}`; // ✅ إضافة /public/
};
// 9. ⭐ للتوافق: MIDDLEWARE لصورة واحدة فقط (للرجعية)
export const uploadProductImage = multer({
    storage: productStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
}).single('image'); // 'image' (مفرد) - للتوافق
// 10. ⭐ للتوافق: التحقق من صورة واحدة
export const validateImageUpload = (req, res, next) => {
    if (!req.file) {
        throw new ValidationError('صورة المنتج مطلوبة');
    }
    if (req.file.filename) {
        req.file.publicUrl = getImageUrl(req.file.filename);
    }
    next();
};
// 11. دالة مساعدة لحذف الملفات
export const deleteFile = (filePath) => {
    return new Promise((resolve) => {
        let fullPath = filePath;
        if (filePath.startsWith('/products/') || filePath.startsWith('products/')) {
            fullPath = path.join('public', filePath);
        }
        const absolutePath = path.isAbsolute(fullPath)
            ? fullPath
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
// 12. دالة مساعدة لحذف الصورة بناءً على الـ URL
export const deleteImageByUrl = (imageUrl) => {
    const filename = path.basename(imageUrl);
    const filePath = path.join('public/products', filename);
    return deleteFile(filePath);
};
// 13. ⭐ دالة لحذف مجموعة من الصور
export const deleteImages = (imageUrls) => {
    const deletePromises = imageUrls.map(url => deleteImageByUrl(url));
    return Promise.all(deletePromises);
};
// 15. إعدادات الـ Express لتقديم الملفات الثابتة
export const staticFilesConfig = {
    publicPath: 'public',
    productsPath: 'public/products'
};
export default {
    uploadProductImages, // ⭐ الرئيسي: لرفع 3 صور
    validateProductImages, // ⭐ الرئيسي: للتحقق من 3 صور
    uploadProductImage, // ⭐ للتوافق: لصورة واحدة
    validateImageUpload, // ⭐ للتوافق: للتحقق من صورة واحدة
    getImageUrl,
    getImageUrls, // ⭐ للحصول على روابط متعددة
    deleteFile,
    deleteImageByUrl,
    deleteImages, // ⭐ لحذف مجموعة صور
    allowedMimeTypes,
    staticFilesConfig
};
