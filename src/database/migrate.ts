import { query } from '../config/database.js';
export const runMigrations = async (): Promise<void> => {
  try {
    console.log('🔄 Applying database updates...');
    
    // SQL migrations directly (without external file)
    const migrations = [
      // 1. Add updated_at to orders
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      
      // 2. Add sales_count to products
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0`,
      
      // 3. Add active to users
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true`,
      
      // 4. Update sales_count based on existing orders
      `UPDATE products SET sales_count = COALESCE((
        SELECT SUM(oi.quantity) 
        FROM order_items oi 
        WHERE oi.product_id = products.id
      ), 0)`
    ];

    // Run each migration
    for (const [index, sql] of migrations.entries()) {
      console.log(`📝 Applying update ${index + 1}/${migrations.length}...`);
      await query(sql);
    }
    
    console.log('✅ Database updated successfully!');
    
  } catch (error) {
    console.error('❌ Failed to update database:', error);
    throw error;
  }
};

// Also export the testConnection function if it doesn't exist
export { testConnection } from '../config/database.js';