import type { MachineStatus } from '@/types';

interface StatusBadgeProps {
  status: MachineStatus;
  showDot?: boolean;
}

const statusConfig: Record<MachineStatus, { className: string; label: string; dotColor: string }> = {
  online: {
    className: 'status-badge-online',
    label: 'Online',
    dotColor: '#22C55E',
  },
  offline: {
    className: 'status-badge-offline',
    label: 'Offline',
    dotColor: '#64748B',
  },
  low_stock: {
    className: 'status-badge-warning',
    label: 'Low Stock',
    dotColor: '#F59E0B',
  },
  critical: {
    className: 'status-badge-critical',
    label: 'Critical',
    dotColor: '#EF4444',
  },
};

export default function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`${config.className} inline-flex items-center gap-1.5`}>
      {showDot && (
        <span
          className={`inline-block rounded-full ${status === 'online' ? 'pulse-dot' : ''}`}
          style={{
            width: 6,
            height: 6,
            backgroundColor: config.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {config.label}
    </span>
  );
}
