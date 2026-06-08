import { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import VendingMachineIcon from '@/components/shared/VendingMachineIcon';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  alertCount?: number;
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'machines', label: 'Machines' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'restock', label: 'Restock Map' },
];

export default function AppHeader({ activeNav, onNavChange, alertCount = 0 }: AppHeaderProps) {
  const { profile, subscription, signOut, isDemoMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const businessName = profile?.business_name ?? 'VendSmart';
  const initials = businessName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-6"
      style={{
        height: 56,
        background: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <VendingMachineIcon size={20} color="#3B82F6" />
        <span className="text-base font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          VendSmart
        </span>
        {isDemoMode && (
          <span
            className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            Demo
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-0.5">
        {navItems.map(item => {
          const isActive = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavChange(item.key)}
              className="relative px-3.5 py-2 text-sm font-medium transition-colors duration-150 rounded-lg"
              style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              onMouseEnter={e => { if (!isActive) (e.target as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!isActive) (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
              {item.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ background: 'var(--accent-blue)' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          className="p-2 rounded-lg transition-colors hidden sm:flex"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Search size={16} />
        </button>

        <button
          onClick={() => onNavChange('alerts')}
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Bell size={16} />
          {alertCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ width: 14, height: 14, background: 'var(--accent-red)', color: 'white', lineHeight: 1 }}
            >
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Plan badge */}
        {subscription && (
          <span
            className="hidden lg:inline text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded"
            style={{
              background: subscription.plan === 'free' ? 'rgba(100,116,139,0.12)' : 'rgba(59,130,246,0.12)',
              color: subscription.plan === 'free' ? '#64748B' : 'var(--accent-blue)',
              border: `1px solid ${subscription.plan === 'free' ? 'rgba(100,116,139,0.2)' : 'rgba(59,130,246,0.2)'}`,
            }}
          >
            {subscription.plan}
          </span>
        )}

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg transition-colors"
            style={{ border: '1px solid var(--border-subtle)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <div
              className="flex items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3B82F6, #22D3EE)', color: 'white' }}
            >
              {initials}
            </div>
            <span className="hidden sm:block text-xs font-medium max-w-[100px] truncate" style={{ color: 'var(--text-secondary)' }}>
              {businessName}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 glass-elevated py-1 z-50"
              style={{ minWidth: 180 }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{businessName}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{profile?.email ?? 'demo@vendsmart.app'}</div>
              </div>
              <button
                onClick={() => { onNavChange('settings'); setDropdownOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Settings size={13} /> Settings & Billing
              </button>
              {!isDemoMode && (
                <button
                  onClick={handleSignOut}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs transition-colors"
                  style={{ color: '#EF4444' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
