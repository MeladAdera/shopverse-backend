// src/config/multer.ts
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../ errors/errorTypes.js';

// استخدام require مع ignore لتفادي مشاكل TypeScript
// @ts-ignore
const path = require('path');
// @ts-ignore  
const fs = require('fs');

// تعريف types للملفات
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
      }
    }
  }
}

// 1. إنشاء مجلدات التحميل إذا لم تكن موجودة
const createUploadsFolders = (): void => {
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
const allowedMimeTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

// 3. تصفية الملفات - التحقق من النوع
const fileFilter = (
  req: Request, 
  file: Express.Multer.File, 
  cb: multer.FileFilterCallback
): void => {
  try {
    if (allowedMimeTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new ValidationError(
        `نوع الملف غير مسموح. المسموح: ${Object.keys(allowedMimeTypes).join(', ')}`
      ));
    }
  } catch (error) {
    cb(error as Error);
  }
};

// 4. إعداد التخزين للمنتجات
const productStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, 'public/products/');
  },
  
  filename: (
    req: Request, 
    file: Express.Multer.File, 
    cb: (error: Error | null, filename: string) => void
  ) => {
    try {
      const fileExt = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const finalName = `product-${uniqueSuffix}${fileExt}`;
      
      cb(null, finalName);
    } catch (error) {
      cb(error as Error, '');
    }
  }
});

// ============================================
// ⭐ MIDDLEWARE لرفع حتى 3 صور (للصور المتعددة)
// ============================================

// 5. ⭐ MIDDLEWARE لرفع حتى 3 صور
export const uploadProductImages = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB لكل صورة
  }
}).array('images', 3);

// 6. ⭐ MIDDLEWARE للتحقق من الصور المتعددة
export const validateProductImages = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    throw new ValidationError('يجب رفع صورة واحدة على الأقل للمنتج');
  }
  
  if (files.length > 3) {
    throw new ValidationError('لا يمكن رفع أكثر من 3 صور للمنتج الواحد');
  }
  
  files.forEach((file: any) => {
    file.publicUrl = `/public/products/${file.filename}`;
  });
  
  next();
};

// 7. ⭐ دالة للحصول على روابط متعددة للصور
export const getImageUrls = (files: Express.Multer.File[]): string[] => {
  if (!files || files.length === 0) return [];
  
  return files.map(file => 
    (file as any).publicUrl || `/public/products/${file.filename}`
  );
};

// 8. دالة للحصول على رابط صورة واحدة
export const getImageUrl = (filename: string): string => {
  return `/public/products/${filename}`;
};

// 9. ⭐ للتوافق: MIDDLEWARE لصورة واحدة فقط
export const uploadProductImage = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
}).single('image');

// 10. ⭐ للتوافق: التحقق من صورة واحدة
export const validateImageUpload = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.file) {
    throw new ValidationError('صورة المنتج مطلوبة');
  }
  
  if (req.file.filename) {
    (req.file as any).publicUrl = getImageUrl(req.file.filename);
  }
  
  next();
};

// 11. دالة مساعدة لحذف الملفات
export const deleteFile = (filePath: string): Promise<boolean> => {
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
      } else {
        console.log(`✅ Deleted file: ${absolutePath}`);
        resolve(true);
      }
    });
  });
};

// 12. دالة مساعدة لحذف الصورة بناءً على الـ URL
export const deleteImageByUrl = (imageUrl: string): Promise<boolean> => {
  const filename = path.basename(imageUrl);
  const filePath = path.join('public/products', filename);
  
  return deleteFile(filePath);
};

// 13. ⭐ دالة لحذف مجموعة من الصور
export const deleteImages = (imageUrls: string[]): Promise<boolean[]> => {
  const deletePromises = imageUrls.map(url => deleteImageByUrl(url));
  return Promise.all(deletePromises);
};

// 14. أنواع التصدير
export interface UploadedFileInfo {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  originalname: string;
  publicUrl?: string;
}

// 15. إعدادات الـ Express لتقديم الملفات الثابتة
export const staticFilesConfig = {
  publicPath: 'public',
  productsPath: 'public/products'
};

export default {
  uploadProductImages,
  validateProductImages,
  uploadProductImage,
  validateImageUpload,
  getImageUrl,
  getImageUrls,
  deleteFile,
  deleteImageByUrl,
  deleteImages,
  allowedMimeTypes,
  staticFilesConfig
};