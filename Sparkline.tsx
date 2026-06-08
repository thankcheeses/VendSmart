interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function Sparkline({
  data,
  width = 120,
  height = 40,
  color = '#22D3EE',
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  // Smooth curve using simple bezier
  const d = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point}`;
    const prev = points[i - 1].split(',').map(Number);
    const curr = point.split(',').map(Number);
    const cpx1 = prev[0] + (curr[0] - prev[0]) / 3;
    const cpx2 = prev[0] + (2 * (curr[0] - prev[0])) / 3;
    return `${path} C ${cpx1},${prev[1]} ${cpx2},${curr[1]} ${curr[0]},${curr[1]}`;
  }, '');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
