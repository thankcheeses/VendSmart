interface ProgressBarProps {
  percentage: number;
  width?: number | string;
  height?: number;
}

export default function ProgressBar({ percentage, width = 80, height = 6 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  let color = '#22C55E';
  if (clamped < 20) color = '#EF4444';
  else if (clamped < 50) color = '#F59E0B';

  const widthStyle = typeof width === 'number' ? `${width}px` : width;

  return (
    <div className="flex items-center gap-2">
      <div style={{ width: widthStyle, height, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${clamped}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.3s ease' }} />
      </div>
      <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--text-secondary)' }}>
        {clamped}%
      </span>
    </div>
  );
}
