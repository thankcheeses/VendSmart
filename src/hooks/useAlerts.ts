import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { alerts as mockAlerts } from '@/data/mockData';
import type { MachineAlert } from '@/types';
import { useAuth } from '@/contexts/useAuth';

/** Reads the signed-in user's alerts, newest first. Touches no React state. */
async function loadAlerts(userId: string): Promise<MachineAlert[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data as MachineAlert[]) ?? [];
}

export function useAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<MachineAlert[]>(isDemoMode ? mockAlerts : []);
  const [loading, setLoading] = useState(!isDemoMode);

  const fetchAlerts = useCallback(async () => {
    if (!supabase || !user) return;
    setAlerts(await loadAlerts(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isDemoMode || !supabase || !user) return;
    // State is only set from the load's callback, never synchronously in the effect.
    let active = true;
    const refresh = () => {
      loadAlerts(user.id).then(data => {
        if (!active) return;
        setAlerts(data);
        setLoading(false);
      });
    };
    refresh();

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
      }, refresh)
      .subscribe();

    return () => { active = false; supabase?.removeChannel(channel); };
  }, [user]);

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
