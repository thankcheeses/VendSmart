import { useState, useMemo } from 'react';
import {
  Activity,
  DollarSign,
  AlertTriangle,
  Gauge,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
} from 'lucide-react';
import type { Machine } from '@/types';
import { machines, alerts, dashboardMetrics } from '@/data/mockData';
import MetricCard from '@/components/shared/MetricCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';
import MachineDetailPanel from '@/components/machines/MachineDetailPanel';

type SortKey = 'name' | 'location' | 'status' | 'fill_percentage' | 'weekly_revenue' | 'last_visit_date';
type SortDir = 'asc' | 'desc';

export default function FleetOverview() {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(machines[0]);
  const [sortKey, setSortKey] = useState<SortKey>('fill_percentage');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [alertBannerVisible, setAlertBannerVisible] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let data = [...machines];
    if (statusFilter !== 'all') {
      data = data.filter((m) => m.status === statusFilter);
    }
    data.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;
      if (sortKey === 'location') {
        valA = a.location_address.toLowerCase();
        valB = b.location_address.toLowerCase();
      } else if (sortKey === 'last_visit_date') {
        valA = a.last_visit_date;
        valB = b.last_visit_date;
      } else if (sortKey === 'status') {
        valA = a.status;
        valB = b.status;
      } else if (sortKey === 'fill_percentage') {
        valA = a.fill_percentage;
        valB = b.fill_percentage;
      } else if (sortKey === 'weekly_revenue') {
        valA = a.weekly_revenue;
        valB = b.weekly_revenue;
      } else {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }
      if (typeof valA === 'string') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [sortKey, sortDir, statusFilter]);

  const criticalAlerts = alerts.filter(
    (a) => !a.acknowledged && (a.severity === 'critical' || a.severity === 'warning')
  );

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="inline ml-0.5" />
    ) : (
      <ChevronDown size={12} className="inline ml-0.5" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Active Machines"
          value={dashboardMetrics.activeMachines}
          subtitle={`of ${dashboardMetrics.totalMachines} total`}
          change={5.6}
          accentColor="blue"
          icon={<Activity size={16} />}
        />
        <MetricCard
          label="Weekly Revenue"
          value={`$${dashboardMetrics.weeklyRevenue.toLocaleString()}`}
          subtitle="7-day trailing"
          change={dashboardMetrics.revenueChange}
          accentColor="green"
          icon={<DollarSign size={16} />}
        />
        <MetricCard
          label="Low Stock Alerts"
          value={dashboardMetrics.lowStockAlerts}
          subtitle={`${dashboardMetrics.criticalAlerts} critical`}
          change={-8}
          accentColor="amber"
          icon={<AlertTriangle size={16} />}
        />
        <MetricCard
          label="Avg. Fill Rate"
          value={`${dashboardMetrics.avgFillRate}%`}
          subtitle="fleet average"
          change={dashboardMetrics.fillRateChange}
          accentColor="cyan"
          icon={<Gauge size={16} />}
        />
      </div>

      {/* Alert Banner */}
      {alertBannerVisible && criticalAlerts.length > 0 && (
        <div
          className="glass-elevated flex items-start gap-3 px-4 py-3"
          style={{ borderLeft: '3px solid var(--accent-amber)' }}
        >
          <AlertTriangle
            size={18}
            style={{ color: 'var(--accent-amber)', marginTop: 1, flexShrink: 0 }}
          />
          <div className="flex-1">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {criticalAlerts.filter((a) => a.severity === 'critical').length} machines
              </span>{' '}
              in your fleet have critically low stock.{' '}
              {criticalAlerts.filter((a) => a.severity === 'warning').length} more need attention soon.
              <button
                className="ml-2 font-medium"
                style={{ color: 'var(--accent-blue)' }}
              >
                View Details →
              </button>
            </p>
          </div>
          <button
            onClick={() => setAlertBannerVisible(false)}
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main content: Table + Detail */}
      <div className="flex gap-5" style={{ minHeight: 500 }}>
        {/* Table */}
        <div className="flex-1 glass-card p-0 overflow-hidden">
          {/* Filter bar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Machine Fleet ({filteredAndSorted.length})
            </h2>
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Filter size={12} />
                {statusFilter === 'all' ? 'All Status' : statusFilter}
              </button>
              {showFilter && (
                <div
                  className="absolute right-0 top-full mt-1 glass-elevated py-1 z-10"
                  style={{ minWidth: 140 }}
                >
                  {['all', 'online', 'low_stock', 'critical', 'offline'].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setStatusFilter(s);
                          setShowFilter(false);
                        }}
                        className="block w-full text-left px-3 py-1.5 text-xs capitalize transition-colors"
                        style={{
                          color:
                            statusFilter === s
                              ? 'var(--accent-blue)'
                              : 'var(--text-secondary)',
                          background:
                            statusFilter === s
                              ? 'rgba(59, 130, 246, 0.1)'
                              : 'transparent',
                        }}
                      >
                        {s === 'all' ? 'All Status' : s.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: 'rgba(15, 15, 22, 0.95)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {[
                    { key: 'name' as SortKey, label: 'Machine Name' },
                    { key: 'location' as SortKey, label: 'Location' },
                    { key: 'status' as SortKey, label: 'Status' },
                    { key: 'fill_percentage' as SortKey, label: 'Fill %' },
                    { key: 'weekly_revenue' as SortKey, label: 'Revenue (7d)' },
                    { key: 'last_visit_date' as SortKey, label: 'Last Visit' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {col.label}
                      <SortIcon col={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((machine) => {
                  const isSelected = selectedMachine?.id === machine.id;
                  return (
                    <tr
                      key={machine.id}
                      onClick={() => setSelectedMachine(machine)}
                      className="table-row-hover cursor-pointer transition-colors"
                      style={{
                        height: 52,
                        background: isSelected
                          ? 'rgba(59, 130, 246, 0.1)'
                          : undefined,
                        borderLeft: isSelected
                          ? '2px solid var(--accent-blue)'
                          : '2px solid transparent',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <td
                        className="px-3 text-[13px] font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {machine.name}
                      </td>
                      <td
                        className="px-3 text-[13px]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {machine.location_address.length > 28
                          ? machine.location_address.slice(0, 28) + '...'
                          : machine.location_address}
                      </td>
                      <td className="px-3">
                        <StatusBadge status={machine.status} />
                      </td>
                      <td className="px-3">
                        <ProgressBar percentage={machine.fill_percentage} />
                      </td>
                      <td
                        className="px-3 text-[13px] font-medium tabular-nums"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        ${machine.weekly_revenue}
                      </td>
                      <td
                        className="px-3 text-[13px]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {machine.last_visit_date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="4" y1="8" x2="20" y2="8" />
                <rect x="7" y="11" width="4" height="4" rx="0.5" />
                <rect x="13" y="11" width="4" height="4" rx="0.5" />
              </svg>
              <p
                className="mt-3 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                No machines match your filters
              </p>
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-2 btn-secondary text-xs"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedMachine && (
          <div
            className="hidden lg:block"
            style={{ width: 320, flexShrink: 0 }}
          >
            <div className="sticky" style={{ top: 80 }}>
              <MachineDetailPanel machine={selectedMachine} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
