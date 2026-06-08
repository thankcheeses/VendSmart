import { useState } from 'react';
import { AlertTriangle, WifiOff, Wrench, TrendingDown, Check, Eye, Calendar } from 'lucide-react';
import type { AlertSeverity, AlertType } from '@/types';
import { useAlerts } from '@/hooks/useAlerts';
import { getDateGroupLabel } from '@/lib/utils';

const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

const alertTypeConfig: Record<AlertType, { icon: typeof AlertTriangle; label: string; color: string }> = {
  low_stock: { icon: AlertTriangle, label: 'Low Stock', color: '#F59E0B' },
  machine_offline: { icon: WifiOff, label: 'Offline', color: '#EF4444' },
  maintenance_due: { icon: Wrench, label: 'Maintenance', color: '#3B82F6' },
  revenue_drop: { icon: TrendingDown, label: 'Revenue Drop', color: '#EF4444' },
};

const severityBadge: Record<AlertSeverity, string> = {
  critical: 'status-badge-critical',
  warning: 'status-badge-warning',
  info: 'status-badge-neutral',
};

const filterOptions = ['All', 'Critical', 'Warning', 'Info', 'Unacknowledged'];

export default function AlertsPage() {
  const { alerts, acknowledgeAlert } = useAlerts();
  const [filter, setFilter] = useState('All');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Unacknowledged') return !a.acknowledged;
    return a.severity.toLowerCase() === filter.toLowerCase();
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const groupedAlerts = sortedAlerts.reduce((groups, alert) => {
    const date = alert.created_at.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(alert);
    return groups;
  }, {} as Record<string, typeof sortedAlerts>);

  const stats = {
    total: alerts.length,
    unack: alerts.filter(a => !a.acknowledged).length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    warning: alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Unacknowledged', value: stats.unack, color: 'var(--accent-amber)' },
          { label: 'Critical', value: stats.critical, color: 'var(--accent-red)' },
          { label: 'Warning', value: stats.warning, color: 'var(--accent-amber)' },
        ].map(s => (
          <div key={s.label} className="glass-card text-center py-4">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-medium font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 flex-wrap">
        {filterOptions.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{
              background: filter === f ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: filter === f ? 'var(--accent-blue)' : 'var(--text-secondary)',
              border: filter === f ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border-subtle)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedAlerts).map(([date, dateAlerts]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={13} />
              <span className="text-xs font-semibold font-medium">{getDateGroupLabel(date)}</span>
            </div>
            <div className="space-y-2">
              {dateAlerts.map(alert => {
                const typeConfig = alertTypeConfig[alert.alert_type];
                const TypeIcon = typeConfig.icon;
                return (
                  <div
                    key={alert.id}
                    className="glass-card py-3 px-4 flex items-start gap-3"
                    style={{ borderLeft: `3px solid ${alert.acknowledged ? 'transparent' : typeConfig.color}`, opacity: alert.acknowledged ? 0.6 : 1 }}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg flex-shrink-0" style={{ background: `${typeConfig.color}15` }}>
                      <TypeIcon size={16} style={{ color: typeConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{alert.machine_name}</span>
                        <span className={severityBadge[alert.severity]}>{alert.severity}</span>
                        {alert.acknowledged && (
                          <span className="status-badge-neutral flex items-center gap-0.5"><Check size={10} /> ack</span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{alert.message}</p>
                      <div className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-xs">
                          {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs">·</span>
                        <span className="text-xs">{typeConfig.label}</span>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                          title="Acknowledge"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                          title="View Machine"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {sortedAlerts.length === 0 && (
          <div className="glass-card text-center py-16">
            <Check size={36} style={{ color: 'var(--accent-green)', margin: '0 auto' }} />
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All clear!</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No alerts match your current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
