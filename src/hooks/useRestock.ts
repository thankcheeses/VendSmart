import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { machines as mockMachines, mockRestockOrders, mockSupplierIntegrations } from '@/data/mockData';
import type { RestockOrder, RestockOrderLineItem, RestockQueueItem, SupplierIntegration } from '@/types';
import { useAuth } from '@/contexts/useAuth';

function buildDemoQueue(): RestockQueueItem[] {
  const queue: RestockQueueItem[] = [];
  for (const m of mockMachines) {
    if (m.status === 'offline') continue;
    if (m.fill_percentage >= 65) continue;

    const currentStock = Math.round((m.capacity_slots * m.fill_percentage) / 100);
    const recommendedQty = Math.max(
      Math.round(m.capacity_slots * 0.9) - currentStock,
      10
    );
    const dailyVelocity = m.weekly_revenue / (m.weekly_revenue > 400 ? 5.5 : 4.5);
    const daysUntilStockout = dailyVelocity > 0 ? currentStock / (dailyVelocity / 3) : 99;
    const urgency = m.fill_percentage < 25 ? 'critical' : 'warning';
    const estimatedCost = recommendedQty * 1.15;

    queue.push({
      machine_id: m.id,
      machine_name: m.name,
      product_id: `${m.id}-stock`,
      product_name: 'Mixed Product Restock',
      current_stock: currentStock,
      capacity: m.capacity_slots,
      reorder_threshold: Math.round(m.capacity_slots * 0.25),
      recommended_qty: recommendedQty,
      days_until_stockout: Math.round(daysUntilStockout * 10) / 10,
      urgency,
      estimated_cost: Math.round(estimatedCost * 100) / 100,
      preferred_supplier: 'amazon_business',
    });
  }
  return queue.sort((a, b) => a.days_until_stockout - b.days_until_stockout);
}

interface RestockData {
  orders: RestockOrder[] | null;
  draftItems: RestockOrderLineItem[] | null;
  suppliers: SupplierIntegration[] | null;
}

/** Reads one user's orders, current draft and supplier links. Touches no React state. */
async function loadRestock(userId: string): Promise<RestockData> {
  if (!supabase) return { orders: null, draftItems: null, suppliers: null };

  const { data } = await supabase
    .from('restock_orders')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'draft')
    .order('created_at', { ascending: false });

  const { data: draft } = await supabase
    .from('restock_orders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: sups } = await supabase
    .from('supplier_integrations')
    .select('*')
    .eq('user_id', userId);

  return {
    orders: data ? (data as RestockOrder[]) : null,
    draftItems: draft ? (draft as RestockOrder).line_items : null,
    suppliers: sups ? (sups as SupplierIntegration[]) : null,
  };
}

export function useRestock() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<RestockOrder[]>(
    isDemoMode ? mockRestockOrders.filter(o => o.status !== 'draft') : []
  );
  const [draftItems, setDraftItems] = useState<RestockOrderLineItem[]>(
    isDemoMode ? (mockRestockOrders.find(o => o.status === 'draft')?.line_items ?? []) : []
  );
  const [suppliers, setSuppliers] = useState<SupplierIntegration[]>(
    isDemoMode ? mockSupplierIntegrations : []
  );
  const [restockQueue] = useState<RestockQueueItem[]>(buildDemoQueue());
  const [loading, setLoading] = useState(!isDemoMode);

  const apply = useCallback((data: RestockData) => {
    if (data.orders) setOrders(data.orders);
    if (data.draftItems) setDraftItems(data.draftItems);
    if (data.suppliers) setSuppliers(data.suppliers);
    setLoading(false);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!supabase || !user) return;
    apply(await loadRestock(user.id));
  }, [user, apply]);

  useEffect(() => {
    if (isDemoMode || !supabase || !user) return;
    // State is only set from the load's callback, never synchronously in the effect.
    let active = true;
    const refresh = () => {
      loadRestock(user.id).then(data => { if (active) apply(data); });
    };
    refresh();

    const channel = supabase
      .channel(`restock_orders:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restock_orders', filter: `user_id=eq.${user.id}` }, refresh)
      .subscribe();

    return () => { active = false; supabase?.removeChannel(channel); };
  }, [user, apply]);

  const addToDraft = useCallback((item: RestockOrderLineItem) => {
    setDraftItems(prev => {
      const existing = prev.findIndex(i => i.product_id === item.product_id && i.machine_name === item.machine_name);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], qty_ordered: updated[existing].qty_ordered + item.qty_ordered, total_price: (updated[existing].qty_ordered + item.qty_ordered) * updated[existing].unit_price };
        return updated;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromDraft = useCallback((productId: string, machineName: string) => {
    setDraftItems(prev => prev.filter(i => !(i.product_id === productId && i.machine_name === machineName)));
  }, []);

  const updateDraftQty = useCallback((productId: string, machineName: string, qty: number) => {
    setDraftItems(prev => prev.map(i =>
      i.product_id === productId && i.machine_name === machineName
        ? { ...i, qty_ordered: qty, total_price: qty * i.unit_price }
        : i
    ));
  }, []);

  const clearDraft = useCallback(() => setDraftItems([]), []);

  const submitOrder = useCallback(async (): Promise<{ error: string | null }> => {
    if (isDemoMode) {
      const total = draftItems.reduce((s, i) => s + i.total_price, 0);
      const newOrder: RestockOrder = {
        id: `ord-demo-${Date.now()}`,
        user_id: 'demo-user',
        supplier: 'amazon_business',
        status: 'submitted',
        line_items: draftItems,
        order_total: total,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      setOrders(prev => [newOrder, ...prev]);
      setDraftItems([]);
      return { error: null };
    }
    if (!supabase || !user) return { error: 'Not authenticated' };

    const total = draftItems.reduce((s, i) => s + i.total_price, 0);
    const { error } = await supabase.from('restock_orders').insert({
      user_id: user.id,
      supplier: 'mixed',
      status: 'submitted',
      line_items: draftItems,
      order_total: total,
      submitted_at: new Date().toISOString(),
    });
    if (!error) {
      setDraftItems([]);
      fetchOrders();
    }
    return { error: error?.message ?? null };
  }, [draftItems, user, fetchOrders]);

  const draftTotal = draftItems.reduce((s, i) => s + i.total_price, 0);

  return {
    restockQueue,
    orders,
    draftItems,
    draftTotal,
    suppliers,
    loading,
    addToDraft,
    removeFromDraft,
    updateDraftQty,
    clearDraft,
    submitOrder,
  };
}
