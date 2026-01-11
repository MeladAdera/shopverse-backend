// src/controllers/productController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ProductService } from '../services/productService.js';
import { catchAsync } from '../ errors/errorTypes.js';
import { ResponseHelper } from '../utils/responseHelper.js';
import { ValidationError } from '../ errors/errorTypes.js';
import { getImageUrls } from '../config/multer.js'; // ⭐ استيراد دالة الحصول على روابط الصور



/**
 * Product controllers
 */
export class ProductController {
  /**
   * Create a new product (admin only) - with multiple image upload support
   */
  static createProduct = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // ⭐ UPDATED: الحصول على الملفات المرفوعة (مصفوفة)
    const uploadedFiles = req.files as Express.Multer.File[];
    
    // ⭐ UPDATED: بناء مصفوفة من روابط الصور
    const imageUrls = uploadedFiles && uploadedFiles.length > 0 
      ? getImageUrls(uploadedFiles) // ⭐ استخدام دالة المساعدة
      : (req.body.image_urls || []);

    // ⭐ UPDATED: إذا كان image_urls سلسلة نصية، حولها إلى مصفوفة
    const finalImageUrls = Array.isArray(imageUrls) 
      ? imageUrls 
      : imageUrls ? [imageUrls] : [];

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      category_id: parseInt(req.body.category_id),
      image_urls: finalImageUrls, // ⭐ مصفوفة تحتوي على روابط متعددة
      
      // 🔥 الحقول الجديدة للفلترة
      color: req.body.color,
      size: req.body.size,
      style: req.body.style,
      brand: req.body.brand,
      gender: req.body.gender as 'men' | 'women' | 'unisex' | 'boys' | 'girls',
      season: req.body.season as 'spring' | 'summer' | 'autumn' | 'winter' | 'all',
      material: req.body.material
    };

    // ⭐ Validate required data
    const requiredFields = ['name', 'description', 'price', 'category_id'];
    const missingFields = requiredFields.filter(field => !productData[field as keyof typeof productData]);
    
    if (missingFields.length > 0) {
      throw new ValidationError(`Required fields missing: ${missingFields.join(', ')}`);
    }

    // ⭐ NEW: Validate images
    if (!productData.image_urls || productData.image_urls.length === 0) {
      throw new ValidationError('At least one image is required');
    }

    const result = await ProductService.createProduct(productData);

    return ResponseHelper.created(res, 'Product created successfully', result);
  });

  /**
   * Get product by ID
   */
  static getProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    
    const product = await ProductService.getProductById(productId);

    return ResponseHelper.success(res, 'Product retrieved successfully', product);
  });

  /**
   * Get all products with filtering
   */
  static getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 🔥 UPDATED: أضف الحقول الجديدة للفلترة
    const filters = {
      category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
      min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
      search: req.query.search as string,
      in_stock: req.query.in_stock === 'true',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sort: req.query.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular',
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      
      // 🔥 الحقول الجديدة للفلترة
      color: req.query.color as string,
      size: req.query.size as string,
      style: req.query.style as string,
      brand: req.query.brand as string,
      gender: req.query.gender as 'men' | 'women' | 'unisex' | 'boys' | 'girls',
      season: req.query.season as 'spring' | 'summer' | 'autumn' | 'winter' | 'all',
      material: req.query.material as string,
      min_sales: req.query.min_sales ? parseInt(req.query.min_sales as string) : undefined,
      
      // 🔥🆕 أضف فلترة الأيام الجديدة هنا
      last_days: req.query.last_days ? parseInt(req.query.last_days as string) : undefined,
      created_after: req.query.created_after as string,
      created_before: req.query.created_before as string
    };

    // ⭐ Validate that numbers are valid
    const sanitizeNumber = (value: any): number | undefined => {
      if (value && !isNaN(Number(value))) return Number(value);
      return undefined;
    };

    filters.category_id = sanitizeNumber(filters.category_id);
    filters.min_price = sanitizeNumber(filters.min_price);
    filters.max_price = sanitizeNumber(filters.max_price);
    filters.page = sanitizeNumber(filters.page) || 1;
    filters.limit = sanitizeNumber(filters.limit) || 20;
    filters.min_sales = sanitizeNumber(filters.min_sales);
    filters.last_days = sanitizeNumber(filters.last_days);

    const result = await ProductService.getProducts(filters);

    return ResponseHelper.success(res, 'Products retrieved successfully', result);
  });

  /**
   * 🔥 NEW: Advanced product search
   */
  static advancedSearch = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const filters = {
      colors: req.body.colors || req.query.colors ? 
        (Array.isArray(req.body.colors || req.query.colors) 
          ? (req.body.colors || req.query.colors) 
          : String(req.body.colors || req.query.colors).split(',')) 
        : undefined,
      sizes: req.body.sizes || req.query.sizes ? 
        (Array.isArray(req.body.sizes || req.query.sizes) 
          ? (req.body.sizes || req.query.sizes) 
          : String(req.body.sizes || req.query.sizes).split(',')) 
        : undefined,
      brands: req.body.brands || req.query.brands ? 
        (Array.isArray(req.body.brands || req.query.brands) 
          ? (req.body.brands || req.query.brands) 
          : String(req.body.brands || req.query.brands).split(',')) 
        : undefined,
      genders: req.body.genders || req.query.genders ? 
        (Array.isArray(req.body.genders || req.query.genders) 
          ? (req.body.genders || req.query.genders) 
          : String(req.body.genders || req.query.genders).split(',')) 
        : undefined,
      seasons: req.body.seasons || req.query.seasons ? 
        (Array.isArray(req.body.seasons || req.query.seasons) 
          ? (req.body.seasons || req.query.seasons) 
          : String(req.body.seasons || req.query.seasons).split(',')) 
        : undefined,
      materials: req.body.materials || req.query.materials ? 
        (Array.isArray(req.body.materials || req.query.materials) 
          ? (req.body.materials || req.query.materials) 
          : String(req.body.materials || req.query.materials).split(',')) 
        : undefined,
      min_price: req.body.min_price || req.query.min_price ? 
        parseFloat(req.body.min_price || req.query.min_price as string) : undefined,
      max_price: req.body.max_price || req.query.max_price ? 
        parseFloat(req.body.max_price || req.query.max_price as string) : undefined,
      category_id: req.body.category_id || req.query.category_id ? 
        parseInt(req.body.category_id || req.query.category_id as string) : undefined,
      page: req.body.page || req.query.page ? 
        parseInt(req.body.page || req.query.page as string) : 1,
      limit: req.body.limit || req.query.limit ? 
        parseInt(req.body.limit || req.query.limit as string) : 20
    };

    // تنظيف القيم
    const sanitizeArray = (arr: any): string[] | undefined => {
      if (!arr) return undefined;
      const cleaned = Array.isArray(arr) 
        ? arr.filter(item => item && item.trim() !== '')
        : [arr].filter(item => item && item.trim() !== '');
      return cleaned.length > 0 ? cleaned : undefined;
    };

    filters.colors = sanitizeArray(filters.colors);
    filters.sizes = sanitizeArray(filters.sizes);
    filters.brands = sanitizeArray(filters.brands);
    filters.genders = sanitizeArray(filters.genders);
    filters.seasons = sanitizeArray(filters.seasons);
    filters.materials = sanitizeArray(filters.materials);

    const result = await ProductService.advancedSearch(filters);

    return ResponseHelper.success(res, 'Advanced search completed successfully', result);
  });

  /**
   * 🔥 NEW: Get available filter options
   */
  static getFilterOptions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const filters = await ProductService.getAvailableFilters();

    return ResponseHelper.success(res, 'Filter options retrieved successfully', filters);
  });

  /**
   * 🔥 NEW: Get top selling products
   */
  static getTopSelling = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const products = await ProductService.getTopSellingProducts(limit);

    return ResponseHelper.success(res, 'Top selling products retrieved successfully', { products });
  });

  /**
   * 🔥 NEW: Get products by gender
   */
  static getProductsByGender = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const gender = req.params.gender as 'men' | 'women' | 'unisex' | 'boys' | 'girls';
    
    // التحقق من صحة قيمة الجنس
    const validGenders = ['men', 'women', 'unisex', 'boys', 'girls'];
    if (!validGenders.includes(gender)) {
      throw new ValidationError(`Invalid gender. Valid values are: ${validGenders.join(', ')}`);
    }

    const products = await ProductService.getProductsByGender(gender);

    return ResponseHelper.success(res, `Products for ${gender} retrieved successfully`, { products });
  });

  /**
   * 🔥 NEW: Get products by season
   */
  static getProductsBySeason = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const season = req.params.season as 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
    
    // التحقق من صحة قيمة الموسم
    const validSeasons = ['spring', 'summer', 'autumn', 'winter', 'all'];
    if (!validSeasons.includes(season)) {
      throw new ValidationError(`Invalid season. Valid values are: ${validSeasons.join(', ')}`);
    }

    const products = await ProductService.getProductsBySeason(season);

    return ResponseHelper.success(res, `Products for ${season} season retrieved successfully`, { products });
  });

  /**
   * 🔥 NEW: Get products by brand
   */
  static getProductsByBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const brand = req.params.brand;
    
    if (!brand || brand.trim() === '') {
      throw new ValidationError('Brand name is required');
    }

    const products = await ProductService.getProductsByBrand(brand);

    return ResponseHelper.success(res, `Products for brand ${brand} retrieved successfully`, { products });
  });

  /**
   * Update product (admin only)
   */
  static updateProduct = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    
    // ⭐ UPDATED: الحصول على الملفات المرفوعة
    const uploadedFiles = req.files as Express.Multer.File[];
    
    // ⭐ UPDATED: بناء مصفوفة من روابط الصور إذا كانت هناك ملفات مرفوعة
    let imageUrls: string[] = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      imageUrls = getImageUrls(uploadedFiles);
    }

    // ⭐ Convert types if data is from form-data
    const updateData: any = { ...req.body };
    
    // ⭐ UPDATED: إذا كانت هناك صور جديدة، استبدل الصور القديمة
    if (imageUrls.length > 0) {
      updateData.image_urls = imageUrls;
    } else if (req.body.image_urls) {
      updateData.image_urls = Array.isArray(req.body.image_urls) 
        ? req.body.image_urls 
        : req.body.image_urls ? [req.body.image_urls] : undefined;
    }
    
    // تحويل الأنواع العددية
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.category_id) updateData.category_id = parseInt(updateData.category_id);
    if (updateData.sales_count) updateData.sales_count = parseInt(updateData.sales_count);
    
    // 🔥 معالجة الحقول الجديدة
    if (updateData.color !== undefined) updateData.color = String(updateData.color);
    if (updateData.size !== undefined) updateData.size = String(updateData.size);
    if (updateData.style !== undefined) updateData.style = String(updateData.style);
    if (updateData.brand !== undefined) updateData.brand = String(updateData.brand);
    if (updateData.gender !== undefined) updateData.gender = String(updateData.gender);
    if (updateData.season !== undefined) updateData.season = String(updateData.season);
    if (updateData.material !== undefined) updateData.material = String(updateData.material);

    const updatedProduct = await ProductService.updateProduct(productId, updateData);

    return ResponseHelper.success(res, 'Product updated successfully', updatedProduct);
  });

  /**
   * Update product images (admin only) - with multiple image upload support
   */
  static updateProductImages = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    
    // ⭐ UPDATED: الحصول على الملفات المرفوعة (مصفوفة)
    const uploadedFiles = req.files as Express.Multer.File[];
    
    let image_urls: string[] = [];

    if (uploadedFiles && uploadedFiles.length > 0) {
      // ⭐ UPDATED: استخدام دالة المساعدة للحصول على روابط الصور
      image_urls = getImageUrls(uploadedFiles);
    } else if (req.body.image_urls) {
      // معالجة image_urls من الجسم إذا كانت موجودة
      image_urls = Array.isArray(req.body.image_urls) 
        ? req.body.image_urls 
        : req.body.image_urls ? [req.body.image_urls] : [];
    }

    if (image_urls.length === 0) {
      throw new ValidationError('Either upload images or provide image_urls');
    }

    const updatedProduct = await ProductService.updateProductImages(productId, image_urls);

    return ResponseHelper.success(res, 'Product images updated successfully', updatedProduct);
  });

  /**
   * Delete product (admin only)
   */
  static deleteProduct = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);

    const result = await ProductService.deleteProduct(productId);

    return ResponseHelper.success(res, result.message);
  });

  /**
   * Get products by category
   */
  static getProductsByCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = parseInt(req.params.categoryId);

    const products = await ProductService.getProductsByCategory(categoryId);

    return ResponseHelper.success(res, 'Products retrieved successfully', products);
  });

  /**
   * Update product stock (admin only)
   */
  static updateProductStock = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    const stock = parseInt(req.body.stock);

    if (isNaN(stock)) {
      throw new ValidationError('Valid stock quantity is required');
    }

    const updatedProduct = await ProductService.updateProductStock(productId, stock);

    return ResponseHelper.success(res, 'Product stock updated successfully', updatedProduct);
  });

  /**
   * 🔥 NEW: Update product sales count
   */
  static updateSalesCount = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    const quantity = parseInt(req.body.quantity);

    if (isNaN(quantity) || quantity <= 0) {
      throw new ValidationError('Valid positive quantity is required');
    }

    await ProductService.updateSalesCount(productId, quantity);

    return ResponseHelper.success(res, 'Sales count updated successfully');
  });

  /**
   * Get product statistics (admin only)
   */
  static getProductStats = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const stats = await ProductService.getProductStats();

    return ResponseHelper.success(res, 'Product stats retrieved successfully', stats);
  });
}

export default ProductController;