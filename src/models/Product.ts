// backend/src/models/Product.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_urls: string[]; 
  category_id: number;
  active: boolean; 
  created_at: Date;
  updated_at?: Date;
  
  // ⭐ الحقول الجديدة للفلترة:
  color?: string;
  size?: string;
  style?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex' | 'boys' | 'girls';
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  material?: string;
  sales_count?: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  image_urls: string[];
  
  // ⭐ الحقول الجديدة الاختيارية:
  color?: string;
  size?: string;
  style?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex' | 'boys' | 'girls';
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  material?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category_id?: number;
  image_urls?: string[];
  active?: boolean;
  
  // ⭐ الحقول الجديدة الاختيارية:
  color?: string;
  size?: string;
  style?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex' | 'boys' | 'girls';
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  material?: string;
}

export interface ProductQueryFilters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  in_stock?: boolean;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  offset?: number;
  
  // ⭐ فلترة حسب الحقول الجديدة:
  color?: string;
  size?: string;
  style?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex' | 'boys' | 'girls';
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  material?: string;
  min_sales?: number; // فلترة حسب الأكثر مبيعاً
}

// ✅ واجهة جديدة لبيانات المنتج مع الصورة
export interface ProductWithCategory extends Product {
  category_name?: string;
}

// ✅ واجهة لرد المنتج (بدون حقول حساسة)
export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_urls: string[];
  category_id: number;
  category_name?: string;
  active?: boolean;
  created_at: Date;
  review_count?: number;
  average_rating?: number;
  
  // ⭐ الحقول الجديدة للعرض:
  color?: string;
  size?: string;
  style?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex' | 'boys' | 'girls';
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  material?: string;
  sales_count?: number;
}

// ✅ واجهة لإنشاء منتج مع تحقق من البيانات
export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_urls: string[];
  category_id: number;
  
  // ⭐ الحقول الجديدة الاختيارية:
  color?: string;
  size?: string;
  style?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex' | 'boys' | 'girls';
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  material?: string;
}

// ✅ واجهة لتحديث منتج
export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category_id?: number;
  image_urls?: string[];
  
  // ⭐ الحقول الجديدة الاختيارية:
  color?: string;
  size?: string;
  style?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex' | 'boys' | 'girls';
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  material?: string;
  active?: boolean;
}

// ✅ واجهة جديدة: فلترة متقدمة
// في models/Product.ts
export interface AdvancedProductFilters {
  colors?: string[];
  sizes?: string[];
  brands?: string[];
  genders?: string[];
  seasons?: string[];
  materials?: string[];
  min_price?: number;
  max_price?: number;
  category_id?: number;
  
  // ⭐ أضف هذين الحقلين
  page?: number;
  limit?: number;
}