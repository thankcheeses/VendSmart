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
    <div className="glass-card flex flex-col justify-between min-h-[96px]">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        {icon && (
          <span style={{ color: accent, opacity: 0.7 }}>
            {icon}
          </span>
        )}
      </div>
      <div className="text-[26px] font-semibold leading-none" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{subtitle}</span>
        {change !== 0 && (
          <span className="text-xs font-medium" style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  );
}
