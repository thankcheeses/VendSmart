import { Bell, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { alerts, dashboardMetrics } from '@/data/mockData';

export default function RightRail() {
  const recentAlerts = alerts
    .filter((a) => !a.acknowledged)
    .slice(0, 5);

  const efficiencyScore = 78;

  return (
    <div
      className="hidden xl:flex flex-col gap-4 p-4 overflow-y-auto scrollbar-thin"
      style={{
        position: 'fixed',
        right: 0,
        top: 56,
        bottom: 0,
        width: 300,
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(12px)',
        borderLeft: '1px solid var(--border-subtle)',
        zIndex: 50,
      }}
    >
      {/* Fleet Efficiency Score */}
      <div className="glass-card text-center">
        <div
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Fleet Efficiency
        </div>
        <div className="relative inline-flex items-center justify-center">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="var(--accent-blue)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(efficiencyScore / 100) * 213.6} 213.6`}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dasharray 0.5s' }}
            />
          </svg>
          <div
            className="absolute text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {efficiencyScore}%
          </div>
        </div>
        <div
          className="text-xs mt-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {dashboardMetrics.activeMachines} of {dashboardMetrics.totalMachines} machines active
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="glass-card flex-1">
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <Bell size={12} />
            Recent Alerts
          </div>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
            }}
          >
            {recentAlerts.length}
          </span>
        </div>
        <div className="space-y-2">
          {recentAlerts.map((alert) => {
            const color =
              alert.severity === 'critical'
                ? '#EF4444'
                : alert.severity === 'warning'
                ? '#F59E0B'
                : '#3B82F6';
            return (
              <div
                key={alert.id}
                className="p-2.5 rounded-lg"
                style={{
                  background: `${color}08`,
                  borderLeft: `2px solid ${color}`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <AlertTriangle size={10} style={{ color }} />
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {alert.machine_name}
                  </span>
                </div>
                <p
                  className="text-xs line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {alert.message}
                </p>
              </div>
            );
          })}
          {recentAlerts.length === 0 && (
            <div
              className="text-center py-4 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              No active alerts
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <div
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Quick Actions
        </div>
        <div className="space-y-2">
          {[
            { label: 'Add Machine', icon: Zap },
            { label: 'Schedule Route', icon: ArrowRight },
            { label: 'Export Report', icon: ArrowRight },
          ].map((action) => (
            <button
              key={action.label}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'rgba(59, 130, 246, 0.08)';
                (e.currentTarget as HTMLElement).style.color =
                  'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'transparent';
                (e.currentTarget as HTMLElement).style.color =
                  'var(--text-secondary)';
              }}
            >
              <action.icon size={12} />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
