"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const productRepository_js_1 = require("../repositories/productRepository.js");
const errorTypes_js_1 = require("../ errors/errorTypes.js");
/**
 * خدمة المنتجات - تحتوي على business logic فقط
 */
class ProductService {
    /**
     * إنشاء منتج جديد
     */
    static async createProduct(productData) {
        const { name, description, price, stock, image_urls, category_id, color, size, style, brand, gender, season, material } = productData;
        // 1. التحقق من البيانات الأساسية ← منطق
        if (price < 0) {
            throw new errorTypes_js_1.ValidationError('Price cannot be negative');
        }
        if (stock < 0) {
            throw new errorTypes_js_1.ValidationError('Stock cannot be negative');
        }
        // ⭐ UPDATED: التحقق من الصور المتعددة
        if (!image_urls || image_urls.length === 0) {
            throw new errorTypes_js_1.ValidationError('At least one image is required');
        }
        if (image_urls.length > this.IMAGE_SETTINGS.MAX_IMAGES_PER_PRODUCT) {
            throw new errorTypes_js_1.ValidationError(`Maximum ${this.IMAGE_SETTINGS.MAX_IMAGES_PER_PRODUCT} images allowed per product`);
        }
        // 2. التحقق من أن السعر منطقي
        if (price > 1000000) {
            throw new errorTypes_js_1.ValidationError('Price is too high');
        }
        // 3. 🔥 NEW: التحقق من صحة قيم الحقول الجديدة
        if (gender && !['men', 'women', 'unisex', 'boys', 'girls'].includes(gender)) {
            throw new errorTypes_js_1.ValidationError('Invalid gender value');
        }
        if (season && !['spring', 'summer', 'autumn', 'winter', 'all'].includes(season)) {
            throw new errorTypes_js_1.ValidationError('Invalid season value');
        }
        if (size && size.length > 20) {
            throw new errorTypes_js_1.ValidationError('Size is too long (max 20 characters)');
        }
        if (brand && brand.length > 100) {
            throw new errorTypes_js_1.ValidationError('Brand name is too long (max 100 characters)');
        }
        // 4. التحقق من عدم وجود منتج بنفس الاسم
        const productExists = await productRepository_js_1.ProductRepository.existsByName(name);
        if (productExists) {
            throw new errorTypes_js_1.ConflictError('Product with this name already exists');
        }
        // 5. إنشاء المنتج ← Repository مع الحقول الجديدة
        const newProduct = await productRepository_js_1.ProductRepository.create({
            name,
            description,
            price,
            stock,
            image_urls,
            category_id,
            color: color || 'black',
            size: size || 'M',
            style: style || 'casual',
            brand: brand || 'Generic',
            gender: gender || 'unisex',
            season: season || 'all',
            material: material || 'cotton'
        });
        // 6. إرجاع النتيجة النهائية
        return this.formatProductResponse(newProduct);
    }
    /**
     * الحصول على منتج بالـ ID
     */
    static async getProductById(id) {
        const product = await productRepository_js_1.ProductRepository.findById(id);
        if (!product) {
            throw new errorTypes_js_1.NotFoundError('Product not found');
        }
        return this.formatProductResponse(product);
    }
    /**
     * الحصول على جميع المنتجات مع التصفية
     */
    static async getProducts(filters = {}) {
        // 1. التحقق من بيانات التصفية ← منطق
        if (filters.min_price && filters.min_price < 0) {
            throw new errorTypes_js_1.ValidationError('Minimum price cannot be negative');
        }
        if (filters.max_price && filters.max_price < 0) {
            throw new errorTypes_js_1.ValidationError('Maximum price cannot be negative');
        }
        if (filters.min_price && filters.max_price && filters.min_price > filters.max_price) {
            throw new errorTypes_js_1.ValidationError('Minimum price cannot be greater than maximum price');
        }
        // 🔥 NEW: التحقق من قيم الحقول الجديدة
        if (filters.gender && !['men', 'women', 'unisex', 'boys', 'girls'].includes(filters.gender)) {
            throw new errorTypes_js_1.ValidationError('Invalid gender filter value');
        }
        if (filters.season && !['spring', 'summer', 'autumn', 'winter', 'all'].includes(filters.season)) {
            throw new errorTypes_js_1.ValidationError('Invalid season filter value');
        }
        // 2. الحصول على المنتجات ← Repository
        const products = await productRepository_js_1.ProductRepository.findAll(filters);
        // 3. الحصول على خيارات الفلترة المتاحة (للعرض في Frontend)
        let filterOptions = {};
        if (filters.category_id || filters.search || filters.min_price || filters.max_price) {
            const availableFilters = await productRepository_js_1.ProductRepository.getFilterOptions();
            filterOptions = {
                availableColors: availableFilters.colors || [],
                availableSizes: availableFilters.sizes || [],
                availableBrands: availableFilters.brands || [],
                priceRange: {
                    min: availableFilters.min_price || 0,
                    max: availableFilters.max_price || 1000
                }
            };
        }
        // 4. تنسيق النتيجة النهائية
        const formattedProducts = products.map(product => this.formatProductResponse(product));
        // 5. حساب Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const offset = filters.offset || ((page - 1) * limit);
        // 6. إرجاع النتيجة مع Pagination و Filter Options
        return {
            products: formattedProducts.slice(offset, offset + limit),
            pagination: {
                page: page,
                limit: limit,
                total: formattedProducts.length,
                totalPages: Math.ceil(formattedProducts.length / limit)
            },
            filters: Object.keys(filterOptions).length > 0 ? filterOptions : undefined
        };
    }
    /**
     * 🔥 NEW: بحث متقدم عن المنتجات
     */
    static async advancedSearch(filters) {
        const { page = 1, limit = 20 } = filters;
        const searchResults = await productRepository_js_1.ProductRepository.advancedSearch({
            colors: filters.colors,
            sizes: filters.sizes,
            brands: filters.brands,
            genders: filters.genders,
            seasons: filters.seasons,
            materials: filters.materials,
            min_price: filters.min_price,
            max_price: filters.max_price,
            category_id: filters.category_id,
            page,
            limit
        });
        const formattedProducts = searchResults.products.map(product => this.formatProductResponse(product));
        return {
            products: formattedProducts,
            pagination: {
                page,
                limit,
                total: searchResults.total,
                totalPages: Math.ceil(searchResults.total / limit)
            },
            appliedFilters: filters
        };
    }
    /**
     * 🔥 NEW: الحصول على خيارات الفلترة المتاحة
     */
    static async getAvailableFilters() {
        const filterOptions = await productRepository_js_1.ProductRepository.getFilterOptions();
        return {
            colors: filterOptions.colors || [],
            sizes: filterOptions.sizes || [],
            brands: filterOptions.brands || [],
            genders: filterOptions.genders || [],
            seasons: filterOptions.seasons || [],
            materials: filterOptions.materials || [],
            styles: filterOptions.styles || [],
            priceRange: {
                min: filterOptions.min_price || 0,
                max: filterOptions.max_price || 1000
            }
        };
    }
    /**
     * تحديث منتج
     */
    static async updateProduct(id, updateData) {
        const productExists = await productRepository_js_1.ProductRepository.exists(id);
        if (!productExists) {
            throw new errorTypes_js_1.NotFoundError('Product not found');
        }
        // التحقق من بيانات التحديث
        if (updateData.price !== undefined && updateData.price < 0) {
            throw new errorTypes_js_1.ValidationError('Price cannot be negative');
        }
        if (updateData.stock !== undefined && updateData.stock < 0) {
            throw new errorTypes_js_1.ValidationError('Stock cannot be negative');
        }
        // ⭐ NEW: التحقق من الصور إذا كانت موجودة في updateData
        if (updateData.image_urls && updateData.image_urls.length > this.IMAGE_SETTINGS.MAX_IMAGES_PER_PRODUCT) {
            throw new errorTypes_js_1.ValidationError(`Maximum ${this.IMAGE_SETTINGS.MAX_IMAGES_PER_PRODUCT} images allowed per product`);
        }
        // 🔥 NEW: التحقق من الحقول الجديدة
        if (updateData.gender && !['men', 'women', 'unisex', 'boys', 'girls'].includes(updateData.gender)) {
            throw new errorTypes_js_1.ValidationError('Invalid gender value');
        }
        if (updateData.season && !['spring', 'summer', 'autumn', 'winter', 'all'].includes(updateData.season)) {
            throw new errorTypes_js_1.ValidationError('Invalid season value');
        }
        if (updateData.size && updateData.size.length > 20) {
            throw new errorTypes_js_1.ValidationError('Size is too long (max 20 characters)');
        }
        // التحقق من عدم وجود منتج آخر بنفس الاسم
        if (updateData.name) {
            const nameExists = await productRepository_js_1.ProductRepository.existsByName(updateData.name, id);
            if (nameExists) {
                throw new errorTypes_js_1.ConflictError('Another product with this name already exists');
            }
        }
        const updatedProduct = await productRepository_js_1.ProductRepository.update(id, updateData);
        if (!updatedProduct) {
            throw new errorTypes_js_1.NotFoundError('Product not found after update');
        }
        return this.formatProductResponse(updatedProduct);
    }
    /**
     * 🔥 NEW: تحديث عداد المبيعات لمنتج
     */
    static async updateSalesCount(productId, quantity) {
        const productExists = await productRepository_js_1.ProductRepository.exists(productId);
        if (!productExists) {
            throw new errorTypes_js_1.NotFoundError('Product not found');
        }
        if (quantity <= 0) {
            throw new errorTypes_js_1.ValidationError('Quantity must be positive');
        }
        await productRepository_js_1.ProductRepository.updateSalesCount(productId, quantity);
    }
    /**
     * تحديث صور المنتج
     */
    static async updateProductImages(id, image_urls) {
        const productExists = await productRepository_js_1.ProductRepository.exists(id);
        if (!productExists) {
            throw new errorTypes_js_1.NotFoundError('Product not found');
        }
        // ⭐ UPDATED: التحقق من الصور المتعددة
        if (!image_urls || image_urls.length === 0) {
            throw new errorTypes_js_1.ValidationError('At least one image is required');
        }
        if (image_urls.length > this.IMAGE_SETTINGS.MAX_IMAGES_PER_PRODUCT) {
            throw new errorTypes_js_1.ValidationError(`Maximum ${this.IMAGE_SETTINGS.MAX_IMAGES_PER_PRODUCT} images allowed per product`);
        }
        const updatedProduct = await productRepository_js_1.ProductRepository.updateImages(id, image_urls);
        if (!updatedProduct) {
            throw new errorTypes_js_1.NotFoundError('Product not found after image update');
        }
        return this.formatProductResponse(updatedProduct);
    }
    /**
     * حذف منتج (Soft Delete)
     */
    static async deleteProduct(id) {
        const productExists = await productRepository_js_1.ProductRepository.exists(id);
        if (!productExists) {
            throw new errorTypes_js_1.NotFoundError('Product not found');
        }
        const deleted = await productRepository_js_1.ProductRepository.softDelete(id);
        if (!deleted) {
            throw new Error('Failed to delete product');
        }
        return { message: 'Product deleted successfully' };
    }
    /**
     * الحصول على منتجات بالتصنيف
     */
    static async getProductsByCategory(categoryId) {
        const products = await productRepository_js_1.ProductRepository.findByCategory(categoryId);
        return products.map(product => this.formatProductResponse(product));
    }
    /**
     * تحديث مخزون المنتج
     */
    static async updateProductStock(id, newStock) {
        if (newStock < 0) {
            throw new errorTypes_js_1.ValidationError('Stock cannot be negative');
        }
        const updated = await productRepository_js_1.ProductRepository.updateStock(id, newStock);
        if (!updated) {
            throw new errorTypes_js_1.NotFoundError('Product not found');
        }
        return this.formatProductResponse(updated);
    }
    /**
     * الحصول على إحصائيات المنتجات
     */
    static async getProductStats() {
        const stats = await productRepository_js_1.ProductRepository.getStats();
        return {
            totalProducts: stats.totalProducts,
            outOfStock: stats.outOfStock,
            totalCategories: stats.totalCategories,
            topBrands: stats.topBrands,
            genderDistribution: stats.genderDistribution
        };
    }
    /**
     * 🔥 NEW: البحث عن المنتجات الأكثر مبيعاً
     */
    static async getTopSellingProducts(limit = 10) {
        const products = await productRepository_js_1.ProductRepository.findAll({
            limit,
            sort: 'popular'
        });
        return products.map(product => this.formatProductResponse(product));
    }
    /**
     * 🔥 NEW: جلب منتجات حسب الجنس
     */
    static async getProductsByGender(gender) {
        const products = await productRepository_js_1.ProductRepository.findAll({ gender });
        return products.map(product => this.formatProductResponse(product));
    }
    /**
     * 🔥 NEW: جلب منتجات حسب الموسم
     */
    static async getProductsBySeason(season) {
        const products = await productRepository_js_1.ProductRepository.findAll({ season });
        return products.map(product => this.formatProductResponse(product));
    }
    /**
     * 🔥 NEW: جلب منتجات حسب العلامة التجارية
     */
    static async getProductsByBrand(brand) {
        const products = await productRepository_js_1.ProductRepository.findAll({ brand });
        return products.map(product => this.formatProductResponse(product));
    }
    /**
     * دالة مساعدة لتنسيق رد المنتج
     */
    static formatProductResponse(product) {
        const imageUrls = Array.isArray(product.image_urls)
            ? product.image_urls
            : (product.image_urls ? [product.image_urls] : []);
        const response = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: product.stock,
            image_urls: imageUrls,
            category_id: product.category_id,
            category_name: product.category_name,
            active: product.active,
            created_at: product.created_at,
            review_count: product.review_count ? parseInt(product.review_count) : 0,
            average_rating: product.average_rating ? parseFloat(product.average_rating) : 0
        };
        // 🔥 NEW: إضافة الحقول الجديدة إلى الـ Response
        if (product.color !== undefined)
            response.color = product.color;
        if (product.size !== undefined)
            response.size = product.size;
        if (product.style !== undefined)
            response.style = product.style;
        if (product.brand !== undefined)
            response.brand = product.brand;
        if (product.gender !== undefined)
            response.gender = product.gender;
        if (product.season !== undefined)
            response.season = product.season;
        if (product.material !== undefined)
            response.material = product.material;
        if (product.sales_count !== undefined)
            response.sales_count = product.sales_count;
        return response;
    }
}
exports.ProductService = ProductService;
// ⭐ إعدادات الصور القابلة للتخصيص
ProductService.IMAGE_SETTINGS = {
    MAX_IMAGES_PER_PRODUCT: 3,
    MAX_IMAGE_URL_LENGTH: 500,
    IMAGE_BASE_PATH: '/products/'
};
