import { Info, X } from 'lucide-react';
import { useState } from 'react';

export default function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 text-sm"
      style={{
        background: 'rgba(59,130,246,0.08)',
        borderBottom: '1px solid rgba(59,130,246,0.15)',
      }}
    >
      <Info size={15} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
      <span style={{ color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Demo Mode</span> — you're viewing mock data.{' '}
        <a
          href="#"
          style={{ color: 'var(--accent-blue)', fontWeight: 500 }}
          onClick={e => { e.preventDefault(); window.open('https://github.com/thankcheeses/vendsmart#setup', '_blank'); }}
        >
          Connect Supabase to go live →
        </a>
      </span>
      <button onClick={() => setVisible(false)} aria-label="Dismiss demo mode notice" className="ml-auto -my-3 -mr-3 flex items-center justify-center w-11 h-11 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        <X size={14} />
      </button>
    </div>
  );
}
