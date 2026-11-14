import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { machines as mockMachines } from '@/data/mockData';
import type { Machine } from '@/types';
import { useAuth } from '@/contexts/useAuth';

/** Reads the signed-in user's machines, newest first. Touches no React state. */
async function loadMachines(userId: string): Promise<{ machines: Machine[] | null; error: string | null }> {
  if (!supabase) return { machines: null, error: null };
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return { machines: null, error: error.message };
  return { machines: (data as Machine[]) ?? [], error: null };
}

export function useMachines() {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>(isDemoMode ? mockMachines : []);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((result: Awaited<ReturnType<typeof loadMachines>>) => {
    if (result.error) setError(result.error);
    else if (result.machines) setMachines(result.machines);
    setLoading(false);
  }, []);

  const fetchMachines = useCallback(async () => {
    if (!supabase || !user) return;
    apply(await loadMachines(user.id));
  }, [user, apply]);

  useEffect(() => {
    if (isDemoMode || !supabase || !user) return;
    // State is only set from the load's callback, never synchronously in the effect.
    let active = true;
    const refresh = () => {
      loadMachines(user.id).then(result => { if (active) apply(result); });
    };
    refresh();

    const channel = supabase
      .channel(`machines:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines', filter: `user_id=eq.${user.id}` }, refresh)
      .subscribe();

    return () => { active = false; supabase?.removeChannel(channel); };
  }, [user, apply]);

  const addMachine = useCallback(async (data: Omit<Machine, 'id' | 'user_id' | 'created_at' | 'status' | 'fill_percentage' | 'weekly_revenue'>) => {
    if (isDemoMode) {
      const newM: Machine = { ...data, id: `m${Date.now()}`, user_id: 'demo-user', status: 'online', fill_percentage: 100, weekly_revenue: 0, created_at: new Date().toISOString() };
      setMachines(prev => [newM, ...prev]);
      return { error: null };
    }
    if (!supabase || !user) return { error: 'Not authenticated' };
    const { error: err } = await supabase.from('machines').insert({ ...data, user_id: user.id, status: 'online', fill_percentage: 100, weekly_revenue: 0 });
    if (!err) fetchMachines();
    return { error: err?.message ?? null };
  }, [user, fetchMachines]);

  const updateMachine = useCallback(async (id: string, updates: Partial<Machine>) => {
    if (isDemoMode) {
      setMachines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      return { error: null };
    }
    if (!supabase) return { error: 'Not configured' };
    const { error: err } = await supabase.from('machines').update(updates).eq('id', id);
    if (!err) fetchMachines();
    return { error: err?.message ?? null };
  }, [fetchMachines]);

  const deleteMachine = useCallback(async (id: string) => {
    if (isDemoMode) {
      setMachines(prev => prev.filter(m => m.id !== id));
      return { error: null };
    }
    if (!supabase) return { error: 'Not configured' };
    const { error: err } = await supabase.from('machines').delete().eq('id', id);
    if (!err) fetchMachines();
    return { error: err?.message ?? null };
  }, [fetchMachines]);

  return { machines, loading, error, addMachine, updateMachine, deleteMachine, refetch: fetchMachines };
}
