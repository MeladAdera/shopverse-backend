-- 📁 /database/migrations/002_admin_dashboard_enhancements.sql

-- 🎯 تحسينات ضرورية للوحة التحكم

-- 1. إضافة updated_at لجدول الطلبات (مهم لتتبع التحديثات)
ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. إعداد trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 3. إضافة sales_count للمنتجات (مهم للإحصائيات)
ALTER TABLE products ADD COLUMN sales_count INTEGER DEFAULT 0;

-- 4. إضافة active status للمستخدمين (لإدارة الحسابات)
ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT true;

-- 5. تحديث المنتجات الحالية لتعيين sales_count بناءً على order_items
UPDATE products 
SET sales_count = (
    SELECT COALESCE(SUM(oi.quantity), 0) 
    FROM order_items oi 
    WHERE oi.product_id = products.id
);