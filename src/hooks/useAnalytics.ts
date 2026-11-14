import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { dailyRevenue as mockRevenue, productPerformance as mockProducts } from '@/data/mockData';
import type { DailyRevenue, Product } from '@/types';
import { useAuth } from '@/contexts/useAuth';

interface AnalyticsData {
  dailyRevenue: DailyRevenue[] | null;
  productPerformance: Product[] | null;
}

/** Reads 30 days of sales and the product table for one user. Touches no React state. */
async function loadAnalytics(userId: string): Promise<AnalyticsData> {
  if (!supabase) return { dailyRevenue: null, productPerformance: null };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [salesRes, productsRes] = await Promise.all([
    supabase
      .from('sales_logs')
      .select('sold_at, revenue')
      .eq('user_id', userId)
      .gte('sold_at', thirtyDaysAgo.toISOString()),
    supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('revenue_7d', { ascending: false }),
  ]);

  let dailyRevenue: DailyRevenue[] | null = null;
  if (salesRes.data) {
    const grouped: Record<string, { total: number; drink: number; snack: number }> = {};
    for (const sale of salesRes.data) {
      const date = new Date(sale.sold_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) grouped[date] = { total: 0, drink: 0, snack: 0 };
      grouped[date].total += sale.revenue;
      grouped[date].drink += sale.revenue * 0.4;
      grouped[date].snack += sale.revenue * 0.35;
    }
    dailyRevenue = Object.entries(grouped).map(([date, v]) => ({ date, total: Math.round(v.total), drink: Math.round(v.drink), snack: Math.round(v.snack) }));
  }

  let productPerformance: Product[] | null = null;
  if (productsRes.data) {
    productPerformance = productsRes.data.map((p: Record<string, unknown>) => ({
      product_id: p.id as string,
      product_name: p.product_name as string,
      category: p.category as string,
      machine_id: p.machine_id as string,
      units_sold_7d: p.units_sold_7d as number,
      revenue_7d: p.revenue_7d as number,
      stock_remaining: p.stock_remaining as number,
    }));
  }

  return { dailyRevenue, productPerformance };
}

export function useAnalytics() {
  const { user } = useAuth();
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>(isDemoMode ? mockRevenue : []);
  const [productPerformance, setProductPerformance] = useState<Product[]>(isDemoMode ? mockProducts : []);
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    if (isDemoMode || !supabase || !user) return;
    // State is only set from the load's callback, never synchronously in the effect.
    let active = true;
    loadAnalytics(user.id).then(data => {
      if (!active) return;
      if (data.dailyRevenue) setDailyRevenue(data.dailyRevenue);
      if (data.productPerformance) setProductPerformance(data.productPerformance);
      setLoading(false);
    });
    return () => { active = false; };
  }, [user]);

  return { dailyRevenue, productPerformance, loading };
}
