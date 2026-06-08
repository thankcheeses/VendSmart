import { Bell, Zap, ArrowRight } from 'lucide-react';
import type { MachineAlert, DashboardMetrics } from '@/types';

interface RightRailProps {
  alerts: MachineAlert[];
  metrics: DashboardMetrics;
  onNavChange?: (nav: string) => void;
}

export default function RightRail({ alerts, metrics, onNavChange }: RightRailProps) {
  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 5);
  const efficiencyScore = metrics.totalMachines > 0
    ? Math.round((metrics.activeMachines / metrics.totalMachines) * 100 * (metrics.avgFillRate / 100))
    : 0;

  const scoreColor = efficiencyScore >= 70 ? 'var(--accent-blue)' : efficiencyScore >= 40 ? 'var(--accent-amber)' : 'var(--accent-red)';

  return (
    <div
      className="hidden xl:flex flex-col gap-3 p-4 overflow-y-auto scrollbar-thin"
      style={{
        position: 'fixed',
        right: 0,
        top: 56,
        bottom: 0,
        width: 272,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        zIndex: 50,
      }}
    >
      {/* Fleet Efficiency Score */}
      <div className="glass-card text-center">
        <div className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          Fleet efficiency
        </div>
        <div className="relative inline-flex items-center justify-center">
          <svg width="76" height="76" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke={scoreColor}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${(efficiencyScore / 100) * 213.6} 213.6`}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dasharray 0.5s' }}
            />
          </svg>
          <div className="absolute text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{efficiencyScore}%</div>
        </div>
        <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
          {metrics.activeMachines} of {metrics.totalMachines} machines active
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="glass-card flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Bell size={12} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Recent alerts</span>
          </div>
          {recentAlerts.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded font-medium tabular-nums" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
              {recentAlerts.length}
            </span>
          )}
        </div>
        <div className="space-y-1">
          {recentAlerts.map(alert => {
            const color = alert.severity === 'critical' ? '#EF4444' : alert.severity === 'warning' ? '#F59E0B' : '#3B82F6';
            return (
              <div key={alert.id} className="flex items-start gap-2.5 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{alert.machine_name}</span>
                  </div>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{alert.message}</p>
                </div>
              </div>
            );
          })}
          {recentAlerts.length === 0 && (
            <div className="flex items-center gap-2 py-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-green)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No active alerts</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <div className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Quick actions</div>
        <div className="space-y-1">
          {[
            { label: 'Add machine', nav: 'machines', icon: Zap },
            { label: 'View restock map', nav: 'restock', icon: ArrowRight },
            { label: 'Analytics report', nav: 'analytics', icon: ArrowRight },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => onNavChange?.(action.nav)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <action.icon size={12} /> {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
