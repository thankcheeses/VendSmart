import { Zap, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

interface UpgradeBannerProps {
  machineCount: number;
  machineLimit: number;
}

export default function UpgradeBanner({ machineCount, machineLimit }: UpgradeBannerProps) {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  if (!visible || machineCount < machineLimit) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 text-sm"
      style={{
        background: 'linear-gradient(90deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.08) 100%)',
        borderBottom: '1px solid rgba(245,158,11,0.2)',
      }}
    >
      <Zap size={15} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
      <span style={{ color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Free tier limit reached</span> — you're using {machineCount}/{machineLimit} machines.{' '}
        <button
          onClick={() => navigate('/settings')}
          style={{ color: 'var(--accent-amber)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Upgrade to Pro for unlimited machines →
        </button>
      </span>
      <button onClick={() => setVisible(false)} className="ml-auto" style={{ color: 'var(--text-muted)' }}>
        <X size={14} />
      </button>
    </div>
  );
}
