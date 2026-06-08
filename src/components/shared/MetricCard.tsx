import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  change: number;
  accentColor?: 'blue' | 'green' | 'amber' | 'cyan' | 'red';
  icon?: ReactNode;
}

const accentMap = {
  blue: '#3B82F6',
  green: '#22C55E',
  amber: '#F59E0B',
  cyan: '#22D3EE',
  red: '#EF4444',
};

export default function MetricCard({ label, value, subtitle, change, accentColor = 'blue', icon }: MetricCardProps) {
  const isPositive = change >= 0;
  const accent = accentMap[accentColor];

  return (
    <div className="glass-card flex flex-col justify-between" style={{ borderLeft: `3px solid ${accent}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        {icon && <span style={{ color: accent, opacity: 0.7 }}>{icon}</span>}
      </div>
      <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
        {value}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{subtitle}</span>
        {change !== 0 && (
          <span className="text-xs font-medium flex items-center gap-0.5" style={{ color: isPositive ? '#22C55E' : '#EF4444' }}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}
