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
    };
  };
};
