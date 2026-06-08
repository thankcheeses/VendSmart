import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { dailyRevenue as mockRevenue, productPerformance as mockProducts } from '@/data/mockData';
import type { DailyRevenue, Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useAnalytics() {
  const { user } = useAuth();
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>(isDemoMode ? mockRevenue : []);
  const [productPerformance, setProductPerformance] = useState<Product[]>(isDemoMode ? mockProducts : []);
  const [loading, setLoading] = useState(!isDemoMode);

  const fetchAnalytics = useCallback(async () => {
    if (!supabase || !user) return;
    setLoading(true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [salesRes, productsRes] = await Promise.all([
      supabase
        .from('sales_logs')
        .select('sold_at, revenue')
        .eq('user_id', user.id)
        .gte('sold_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('revenue_7d', { ascending: false }),
    ]);

    if (salesRes.data) {
      const grouped: Record<string, { total: number; drink: number; snack: number }> = {};
      for (const sale of salesRes.data) {
        const date = new Date(sale.sold_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!grouped[date]) grouped[date] = { total: 0, drink: 0, snack: 0 };
        grouped[date].total += sale.revenue;
        grouped[date].drink += sale.revenue * 0.4;
        grouped[date].snack += sale.revenue * 0.35;
      }
      setDailyRevenue(Object.entries(grouped).map(([date, v]) => ({ date, total: Math.round(v.total), drink: Math.round(v.drink), snack: Math.round(v.snack) })));
    }

    if (productsRes.data) {
      setProductPerformance(productsRes.data.map((p: Record<string, unknown>) => ({
        product_id: p.id as string,
        product_name: p.product_name as string,
        category: p.category as string,
        machine_id: p.machine_id as string,
        units_sold_7d: p.units_sold_7d as number,
        revenue_7d: p.revenue_7d as number,
        stock_remaining: p.stock_remaining as number,
      })));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isDemoMode || !supabase || !user) return;
    fetchAnalytics();
  }, [user, fetchAnalytics]);

  return { dailyRevenue, productPerformance, loading };
}
