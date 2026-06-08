import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url';

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl!, supabaseAnonKey!);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          business_name: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          business_name: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          email?: string;
          avatar_url?: string | null;
        };
      };
      machines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location_address: string;
          latitude: number;
          longitude: number;
          machine_type: string;
          capacity_slots: number;
          commission_percent: number;
          status: string;
          fill_percentage: number;
          weekly_revenue: number;
          last_visit_date: string;
          site_type: string;
          created_at: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          machine_id: string;
          machine_name: string;
          alert_type: string;
          severity: string;
          message: string;
          acknowledged: boolean;
          created_at: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          machine_limit: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          created_at: string;
        };
      };
      restock_orders: {
        Row: {
          id: string;
          user_id: string;
          supplier: string;
          status: string;
          line_items: unknown;
          order_total: number;
          supplier_order_id: string | null;
          tracking_number: string | null;
          estimated_delivery: string | null;
          notes: string | null;
          submitted_at: string | null;
          created_at: string;
        };
      };
      supplier_integrations: {
        Row: {
          id: string;
          user_id: string;
          supplier_name: string;
          status: string;
          credentials: unknown;
          last_sync_at: string | null;
          created_at: string;
        };
      };
    };
  };
};
