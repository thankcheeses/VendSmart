import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { alerts as mockAlerts } from '@/data/mockData';
import type { MachineAlert } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<MachineAlert[]>(isDemoMode ? mockAlerts : []);
  const [loading, setLoading] = useState(!isDemoMode);

  const fetchAlerts = useCallback(async () => {
    if (!supabase || !user) return;
    setLoading(true);
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setAlerts((data as MachineAlert[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isDemoMode || !supabase || !user) return;
    fetchAlerts();

    const channel = supabase
      .channel(`alerts:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setAlerts(prev => [payload.new as MachineAlert, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'alerts',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, [user, fetchAlerts]);

  const acknowledgeAlert = useCallback(async (id: string) => {
    if (isDemoMode) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
      return;
    }
    if (!supabase) return;
    await supabase.from('alerts').update({ acknowledged: true }).eq('id', id);
  }, []);

  return { alerts, loading, acknowledgeAlert, refetch: fetchAlerts };
}
