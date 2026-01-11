// 📁 src/models/Cart.ts
export interface Cart {
  id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
}

export interface CartWithItems extends Cart {
  items: (CartItem & {
    product_name: string;
    product_price: number;
    product_images: string[]; // ⬅️ غير من image إلى images
    product_stock: number;
    product_active: boolean; // ⬅️ أضف هذا
  })[];
}

// 🆕 أضف واجهة CartResponse
export interface CartResponse {
  id: number;
  user_id: number;
  items_count: number;
  total_price: number;
  items: {
    id: number;
    product_id: number;
    product_name: string;
    product_price: number;
    product_images: string[];
    product_stock: number;
    quantity: number;
    item_total: number;
  }[];
}