interface VendingMachineIconProps {
  size?: number;
  color?: string;
}

export default function VendingMachineIcon({ size = 20, color = '#3B82F6' }: VendingMachineIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="4" y1="8" x2="20" y2="8" />
      <rect x="7" y="11" width="4" height="4" rx="0.5" />
      <rect x="13" y="11" width="4" height="4" rx="0.5" />
      <rect x="14" y="17" width="4" height="2" rx="0.5" />
      <line x1="8" y1="6" x2="10" y2="6" />
      <line x1="14" y1="6" x2="16" y2="6" />
    </svg>
  );
}
