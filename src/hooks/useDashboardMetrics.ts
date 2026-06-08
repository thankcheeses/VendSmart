import { useMemo } from 'react';
import type { Machine, MachineAlert, DashboardMetrics } from '@/types';

export function useDashboardMetrics(machines: Machine[], alerts: MachineAlert[]): DashboardMetrics {
  return useMemo(() => {
    const activeMachines = machines.filter(m => m.status === 'online').length;
    const nonOffline = machines.filter(m => m.status !== 'offline');
    const avgFillRate = nonOffline.length
      ? Math.round(nonOffline.reduce((s, m) => s + m.fill_percentage, 0) / nonOffline.length)
      : 0;

    return {
      activeMachines,
      totalMachines: machines.length,
      weeklyRevenue: machines.reduce((s, m) => s + m.weekly_revenue, 0),
      revenueChange: 7.2,
      lowStockAlerts: alerts.filter(a => !a.acknowledged && a.alert_type === 'low_stock').length,
      criticalAlerts: alerts.filter(a => !a.acknowledged && a.severity === 'critical').length,
      avgFillRate,
      fillRateChange: -2.1,
    };
  }, [machines, alerts]);
}
