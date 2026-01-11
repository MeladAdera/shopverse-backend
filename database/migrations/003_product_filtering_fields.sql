-- 📁 /database/migrations/003_product_filtering_fields.sql
-- 🎯 Migration to add advanced filtering fields to products table

-- 1. Add all new filtering columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS size VARCHAR(20),
ADD COLUMN IF NOT EXISTS style VARCHAR(50),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('men', 'women', 'unisex', 'boys', 'girls')),
ADD COLUMN IF NOT EXISTS season VARCHAR(20) CHECK (season IN ('spring', 'summer', 'autumn', 'winter', 'all')),
ADD COLUMN IF NOT EXISTS material VARCHAR(100),
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- 2. Add index for better performance on frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_season ON products(season);

-- 3. Update existing products with default values (optional)
-- You can remove or modify this section based on your needs
UPDATE products 
SET 
    color = COALESCE(color, 'black'),
    size = COALESCE(size, 'M'),
    style = COALESCE(style, 'casual'),
    brand = COALESCE(brand, 'Generic'),
    gender = COALESCE(gender, 'unisex'),
    season = COALESCE(season, 'all'),
    material = COALESCE(material, 'cotton')
WHERE color IS NULL 
   OR size IS NULL 
   OR style IS NULL 
   OR brand IS NULL 
   OR gender IS NULL 
   OR season IS NULL 
   OR material IS NULL;

-- 4. Add comments to columns for documentation
COMMENT ON COLUMN products.color IS 'Product color for filtering';
COMMENT ON COLUMN products.size IS 'Product size (e.g., 42, M, L, XL)';
COMMENT ON COLUMN products.style IS 'Product style (e.g., sport, casual, formal)';
COMMENT ON COLUMN products.brand IS 'Product brand name';
COMMENT ON COLUMN products.gender IS 'Target gender: men, women, unisex, boys, girls';
COMMENT ON COLUMN products.season IS 'Seasonal category: spring, summer, autumn, winter, all';
COMMENT ON COLUMN products.material IS 'Primary material composition';
COMMENT ON COLUMN products.sales_count IS 'Total number of units sold (updated via triggers)';

-- 5. Optional: Create a function to automatically update sales_count
-- This function can be called from your application when orders are completed
CREATE OR REPLACE FUNCTION update_product_sales_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update sales_count when order items are added
    UPDATE products p
    SET sales_count = (
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM order_items oi
        WHERE oi.product_id = p.id
    )
    WHERE p.id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Optional: Create trigger to auto-update sales_count
-- Uncomment if you want automatic updates
/*
CREATE TRIGGER update_sales_count_after_order
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_product_sales_count();
*/

-- 7. Migration completion message
DO $$ 
BEGIN
    RAISE NOTICE 'Migration 003 completed successfully. Added 8 filtering fields to products table.';
END $$;