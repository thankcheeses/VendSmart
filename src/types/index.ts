export type MachineStatus = 'online' | 'offline' | 'low_stock' | 'critical';
export type MachineType = 'snack' | 'drink' | 'combo';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 'low_stock' | 'machine_offline' | 'maintenance_due' | 'revenue_drop';
export type PlanType = 'free' | 'operator' | 'pro' | 'business' | 'enterprise';
export type SupplierName = 'amazon_business' | 'sysco' | 'sams_club' | 'walmart_business' | 'manual';
export type RestockOrderStatus = 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type SiteType = 'office' | 'manufacturing' | 'hospital' | 'school' | 'hotel' | 'gym' | 'transit' | 'retail' | 'other';

export interface Machine {
  id: string;
  user_id: string;
  name: string;
  location_address: string;
  latitude: number;
  longitude: number;
  machine_type: MachineType;
  capacity_slots: number;
  commission_percent: number;
  status: MachineStatus;
  fill_percentage: number;
  weekly_revenue: number;
  last_visit_date: string;
  site_type?: SiteType;
  created_at: string;
}

export interface MachineAlert {
  id: string;
  machine_id: string;
  machine_name: string;
  user_id?: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export interface Product {
  product_id: string;
  product_name: string;
  category: string;
  machine_id: string;
  units_sold_7d: number;
  revenue_7d: number;
  stock_remaining: number;
  sku?: string;
  upc?: string;
  reorder_threshold?: number;
  reorder_quantity?: number;
  preferred_supplier?: SupplierName;
  unit_cost?: number;
  unit_price?: number;
}

export interface DailyRevenue {
  date: string;
  total: number;
  drink: number;
  snack: number;
}

export interface DashboardMetrics {
  activeMachines: number;
  totalMachines: number;
  weeklyRevenue: number;
  revenueChange: number;
  lowStockAlerts: number;
  criticalAlerts: number;
  avgFillRate: number;
  fillRateChange: number;
}

export interface Profile {
  id: string;
  business_name: string;
  email: string;
  avatar_url?: string;
  is_super_admin?: boolean;
  created_at: string;
}

export interface AdminTenant {
  user_id: string;
  business_name: string;
  email: string;
  plan: PlanType;
  plan_status: 'active' | 'cancelled' | 'past_due';
  machine_count: number;
  weekly_revenue: number;
  machine_limit: number;
  joined_at: string;
  last_active?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: 'active' | 'cancelled' | 'past_due';
  machine_limit: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
  created_at: string;
}

export interface RestockOrderLineItem {
  product_id: string;
  product_name: string;
  machine_name: string;
  upc?: string;
  supplier_sku?: string;
  qty_ordered: number;
  unit_price: number;
  total_price: number;
  supplier: SupplierName;
}

export interface RestockOrder {
  id: string;
  user_id: string;
  supplier: SupplierName | 'mixed';
  status: RestockOrderStatus;
  line_items: RestockOrderLineItem[];
  order_total: number;
  supplier_order_id?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
  submitted_at?: string;
  created_at: string;
}

export interface SupplierIntegration {
  id: string;
  user_id: string;
  supplier_name: SupplierName;
  status: 'connected' | 'disconnected' | 'error';
  last_sync_at?: string;
  created_at: string;
}

export interface RestockQueueItem {
  machine_id: string;
  machine_name: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  capacity: number;
  reorder_threshold: number;
  recommended_qty: number;
  days_until_stockout: number;
  urgency: 'critical' | 'warning';
  estimated_cost: number;
  preferred_supplier: SupplierName;
}
