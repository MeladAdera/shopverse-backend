// 📁 src/types/statsTypes.ts
export interface UserStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  new_users_week: number;
}

export interface ProductStats {
  total_products: number;
  in_stock: number;
  out_of_stock: number;
  inactive_products: number;
  total_sales: number;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  new_orders_week: number;
}

export interface RevenueStats {
  total_revenue: number;
  confirmed_revenue: number;
  revenue_30_days: number;
}

export interface DashboardStats {
  users: UserStats;
  products: ProductStats;
  orders: OrderStats;
  revenue: RevenueStats;
  recent_orders: any[];
  summary: {
    total_revenue: number;
    total_orders: number;
    total_users: number;
    total_products: number;
  };
}