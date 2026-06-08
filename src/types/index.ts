export type MachineStatus = 'online' | 'offline' | 'low_stock' | 'critical';
export type MachineType = 'snack' | 'drink' | 'combo';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 'low_stock' | 'machine_offline' | 'maintenance_due' | 'revenue_drop';
export type PlanType = 'free' | 'pro' | 'enterprise';

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
  created_at: string;
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
