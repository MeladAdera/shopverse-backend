import { pool } from '../config/database.js';
import { 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  ProductWithCategory,
  ProductQueryFilters 
} from '../models/Product.js';

export class ProductRepository {
  
  /**
   * Create a new product
   */
  static async create(productData: CreateProductData): Promise<Product> {
    const { 
      name, description, price, stock, image_urls, category_id,
      color, size, style, brand, gender, season, material 
    } = productData;
    
    const query = `
      INSERT INTO products (
        name, description, price, stock, category_id, image_urls,
        color, size, style, brand, gender, season, material
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const values = [
      name, description, price, stock, category_id, image_urls,
      color || 'black', size || 'M', style || 'casual', 
      brand || 'Generic', gender || 'unisex', season || 'all', 
      material || 'cotton'
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  /**
   * Get all products with advanced filtering
   */
  static async findAll(filters: ProductQueryFilters = {}): Promise<ProductWithCategory[]> {
    let query = `
      SELECT 
        p.*, 
        c.name as category_name,
        COUNT(r.id) as review_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.active = true
    `;
    
    const values: any[] = [];
    let paramCount = 1;

    // 🔹 Filter by category
    if (filters.category_id) {
      query += ` AND p.category_id = $${paramCount}`;
      values.push(filters.category_id);
      paramCount++;
    }

    // 🔹 Search by name or description
    if (filters.search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // 🔹 Filter by price range
    if (filters.min_price) {
      query += ` AND p.price >= $${paramCount}`;
      values.push(filters.min_price);
      paramCount++;
    }

    if (filters.max_price) {
      query += ` AND p.price <= $${paramCount}`;
      values.push(filters.max_price);
      paramCount++;
    }

    // 🔹 Filter by stock
    if (filters.in_stock) {
      query += ` AND p.stock > 0`;
    }

    // 🔹 🔥 NEW: Filter by color
    if (filters.color) {
      if (Array.isArray(filters.color)) {
        query += ` AND p.color = ANY($${paramCount})`;
        values.push(filters.color);
      } else {
        query += ` AND p.color = $${paramCount}`;
        values.push(filters.color);
      }
      paramCount++;
    }

    // 🔹 🔥 NEW: Filter by size
    if (filters.size) {
      if (Array.isArray(filters.size)) {
        query += ` AND p.size = ANY($${paramCount})`;
        values.push(filters.size);
      } else {
        query += ` AND p.size = $${paramCount}`;
        values.push(filters.size);
      }
      paramCount++;
    }

    // 🔹 🔥 NEW: Filter by brand
    if (filters.brand) {
      if (Array.isArray(filters.brand)) {
        query += ` AND p.brand = ANY($${paramCount})`;
        values.push(filters.brand);
      } else {
        query += ` AND p.brand = $${paramCount}`;
        values.push(filters.brand);
      }
      paramCount++;
    }

    // 🔹 🔥 NEW: Filter by gender
    if (filters.gender) {
      if (Array.isArray(filters.gender)) {
        query += ` AND p.gender = ANY($${paramCount})`;
        values.push(filters.gender);
      } else {
        query += ` AND p.gender = $${paramCount}`;
        values.push(filters.gender);
      }
      paramCount++;
    }

    // 🔹 🔥 NEW: Filter by season
    if (filters.season) {
      if (Array.isArray(filters.season)) {
        query += ` AND p.season = ANY($${paramCount})`;
        values.push(filters.season);
      } else {
        query += ` AND p.season = $${paramCount}`;
        values.push(filters.season);
      }
      paramCount++;
    }

    // 🔹 🔥 NEW: Filter by material
    if (filters.material) {
      if (Array.isArray(filters.material)) {
        query += ` AND p.material = ANY($${paramCount})`;
        values.push(filters.material);
      } else {
        query += ` AND p.material = $${paramCount}`;
        values.push(filters.material);
      }
      paramCount++;
    }

    // 🔹 🔥 NEW: Filter by minimum sales
    if (filters.min_sales) {
      query += ` AND p.sales_count >= $${paramCount}`;
      values.push(filters.min_sales);
      paramCount++;
    }

    // 🔹 🔥 NEW: Filter by style
    if (filters.style) {
      if (Array.isArray(filters.style)) {
        query += ` AND p.style = ANY($${paramCount})`;
        values.push(filters.style);
      } else {
        query += ` AND p.style = $${paramCount}`;
        values.push(filters.style);
      }
      paramCount++;
    }

    // Group for reviews
    query += ` GROUP BY p.id, c.name`;

    // 🔥 NEW: Enhanced sorting options
    switch (filters.sort) {
      case 'price_asc':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'popular':
        // Sort by sales count (most popular products)
        query += ` ORDER BY p.sales_count DESC, average_rating DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY p.created_at DESC`;
        break;
    }

    // Pagination
    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
      
      if (filters.offset) {
        query += ` OFFSET $${paramCount}`;
        values.push(filters.offset);
        paramCount++;
      }
    }

    console.log('Product Query:', query); // For debugging
    console.log('Query Values:', values); // For debugging

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get product by ID
   */
  static async findById(id: number): Promise<ProductWithCategory | null> {
    const query = `
      SELECT 
        p.*, 
        c.name as category_name,
        COUNT(r.id) as review_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = $1 AND p.active = true
      GROUP BY p.id, c.name
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Update product
   */
  static async update(id: number, productData: UpdateProductData): Promise<Product | null> {
    const fields: string[] = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic query with new fields
    const fieldMapping: Record<string, any> = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category_id: productData.category_id,
      image_urls: productData.image_urls,
      active: productData.active,
      // 🔥 NEW: Add new filtering fields
      color: productData.color,
      size: productData.size,
      style: productData.style,
      brand: productData.brand,
      gender: productData.gender,
      season: productData.season,
      material: productData.material
    };

    Object.entries(fieldMapping).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE products 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} AND active = true
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * 🔥 NEW: Get unique filter options for frontend
   */
  static async getFilterOptions() {
    const query = `
      SELECT 
        ARRAY_AGG(DISTINCT color) FILTER (WHERE color IS NOT NULL) as colors,
        ARRAY_AGG(DISTINCT size) FILTER (WHERE size IS NOT NULL) as sizes,
        ARRAY_AGG(DISTINCT brand) FILTER (WHERE brand IS NOT NULL) as brands,
        ARRAY_AGG(DISTINCT gender) FILTER (WHERE gender IS NOT NULL) as genders,
        ARRAY_AGG(DISTINCT season) FILTER (WHERE season IS NOT NULL) as seasons,
        ARRAY_AGG(DISTINCT material) FILTER (WHERE material IS NOT NULL) as materials,
        ARRAY_AGG(DISTINCT style) FILTER (WHERE style IS NOT NULL) as styles,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM products
      WHERE active = true
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  /**
   * 🔥 NEW: Get products by multiple filters (advanced search)
   */
  static async advancedSearch(filters: {
    colors?: string[];
    sizes?: string[];
    brands?: string[];
    genders?: string[];
    seasons?: string[];
    materials?: string[];
    min_price?: number;
    max_price?: number;
    category_id?: number;
    page?: number;
    limit?: number;
  }): Promise<{ products: ProductWithCategory[]; total: number }> {
    let query = `
      SELECT 
        p.*, 
        c.name as category_name,
        COUNT(r.id) as review_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.active = true
    `;
    
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.active = true
    `;
    
    const values: any[] = [];
    const countValues: any[] = [];
    let paramCount = 1;

    // Apply filters
    if (filters.colors && filters.colors.length > 0) {
      query += ` AND p.color = ANY($${paramCount})`;
      countQuery += ` AND p.color = ANY($${paramCount})`;
      values.push(filters.colors);
      countValues.push(filters.colors);
      paramCount++;
    }

    if (filters.sizes && filters.sizes.length > 0) {
      query += ` AND p.size = ANY($${paramCount})`;
      countQuery += ` AND p.size = ANY($${paramCount})`;
      values.push(filters.sizes);
      countValues.push(filters.sizes);
      paramCount++;
    }

    if (filters.brands && filters.brands.length > 0) {
      query += ` AND p.brand = ANY($${paramCount})`;
      countQuery += ` AND p.brand = ANY($${paramCount})`;
      values.push(filters.brands);
      countValues.push(filters.brands);
      paramCount++;
    }

    if (filters.category_id) {
      query += ` AND p.category_id = $${paramCount}`;
      countQuery += ` AND p.category_id = $${paramCount}`;
      values.push(filters.category_id);
      countValues.push(filters.category_id);
      paramCount++;
    }

    if (filters.min_price) {
      query += ` AND p.price >= $${paramCount}`;
      countQuery += ` AND p.price >= $${paramCount}`;
      values.push(filters.min_price);
      countValues.push(filters.min_price);
      paramCount++;
    }

    if (filters.max_price) {
      query += ` AND p.price <= $${paramCount}`;
      countQuery += ` AND p.price <= $${paramCount}`;
      values.push(filters.max_price);
      countValues.push(filters.max_price);
      paramCount++;
    }

    // Group and pagination
    query += ` GROUP BY p.id, c.name`;
    query += ` ORDER BY p.sales_count DESC, p.created_at DESC`;

    if (filters.limit) {
      const offset = ((filters.page || 1) - 1) * filters.limit;
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
      
      if (offset > 0) {
        query += ` OFFSET $${paramCount}`;
        values.push(offset);
      }
    }

    // Execute queries
    const [productsResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, countValues)
    ]);

    return {
      products: productsResult.rows,
      total: parseInt(countResult.rows[0]?.total || '0')
    };
  }

  /**
   * 🔥 NEW: Update sales count for a product
   */
  static async updateSalesCount(productId: number, quantity: number): Promise<void> {
    await pool.query(
      `UPDATE products 
       SET sales_count = sales_count + $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [quantity, productId]
    );
  }

  /**
   * Soft delete
   */
  static async softDelete(id: number): Promise<boolean> {
    const query = `
      UPDATE products 
      SET active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND active = true
    `;
    
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Hard delete
   */
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * Check if product exists
   */
  static async exists(id: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM products WHERE id = $1 AND active = true',
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * Check if product with same name exists
   */
  static async existsByName(name: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT id FROM products WHERE name = $1 AND active = true`;
    const values: any[] = [name];

    if (excludeId) {
      query += ` AND id != $2`;
      values.push(excludeId);
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }

  /**
   * Update stock
   */
  static async updateStock(id: number, newStock: number): Promise<Product | null> {
    const query = `
      UPDATE products 
      SET stock = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND active = true
      RETURNING *
    `;
    
    const result = await pool.query(query, [newStock, id]);
    return result.rows[0] || null;
  }

  /**
   * Find products by category
   */
  static async findByCategory(categoryId: number): Promise<ProductWithCategory[]> {
    const query = `
      SELECT 
        p.*, 
        c.name as category_name,
        COUNT(r.id) as review_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.category_id = $1 AND p.active = true
      GROUP BY p.id, c.name
      ORDER BY p.created_at DESC
    `;
    
    const result = await pool.query(query, [categoryId]);
    return result.rows;
  }

  /**
   * Update images only
   */
  static async updateImages(id: number, image_urls: string[]): Promise<Product | null> {
    const result = await pool.query(
      `UPDATE products SET image_urls = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND active = true
       RETURNING *`,
      [image_urls, id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get product statistics
   */
  static async getStats(): Promise<{
    totalProducts: number;
    outOfStock: number;
    totalCategories: number;
    topBrands: { brand: string; count: number }[];
    genderDistribution: { gender: string; count: number }[];
  }> {
    const [
      totalResult,
      outOfStockResult,
      categoriesResult,
      brandsResult,
      genderResult
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM products WHERE active = true'),
      pool.query('SELECT COUNT(*) as count FROM products WHERE stock = 0 AND active = true'),
      pool.query('SELECT COUNT(DISTINCT category_id) as count FROM products WHERE active = true'),
      pool.query(`
        SELECT brand, COUNT(*) as count 
        FROM products 
        WHERE brand IS NOT NULL AND active = true 
        GROUP BY brand 
        ORDER BY count DESC 
        LIMIT 5
      `),
      pool.query(`
        SELECT gender, COUNT(*) as count 
        FROM products 
        WHERE gender IS NOT NULL AND active = true 
        GROUP BY gender 
        ORDER BY count DESC
      `)
    ]);

    return {
      totalProducts: parseInt(totalResult.rows[0].count),
      outOfStock: parseInt(outOfStockResult.rows[0].count),
      totalCategories: parseInt(categoriesResult.rows[0].count),
      topBrands: brandsResult.rows,
      genderDistribution: genderResult.rows
    };
  }
}