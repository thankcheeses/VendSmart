import { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Settings, ChevronDown, AlertTriangle, X, CheckCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import VendingMachineIcon from '@/components/shared/VendingMachineIcon';
import { useAuth } from '@/contexts/AuthContext';
import type { MachineAlert } from '@/types';

interface AppHeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  alertCount?: number;
  alerts?: MachineAlert[];
  onAcknowledgeAlert?: (id: string) => void;
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'machines', label: 'Machines' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'restock', label: 'Map' },
  { key: 'orders', label: 'Orders' },
];

const adminNavItem = { key: 'admin', label: 'Admin' };

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const panelBase: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 8px)',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-medium)',
  borderRadius: 8,
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  zIndex: 200,
  overflow: 'hidden',
};

export default function AppHeader({ activeNav, onNavChange, alertCount = 0, alerts = [], onAcknowledgeAlert }: AppHeaderProps) {
  const { profile, subscription, signOut, isDemoMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const businessName = profile?.business_name ?? 'VendSmart';
  const initials = businessName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const unacked = alerts.filter(a => !a.acknowledged);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDropdownOpen(false); setNotifOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
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
        background: 'rgba(9, 9, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <VendingMachineIcon size={20} color="#3B82F6" />
        <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          VendSmart
        </span>
        {isDemoMode && (
          <span
            className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.18)' }}
          >
            Demo
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center">
        {[...navItems, ...(profile?.is_super_admin || isDemoMode ? [adminNavItem] : [])].map(item => {
          const isActive = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavChange(item.key)}
              className="px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 rounded-md"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-1">

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(v => !v); setDropdownOpen(false); }}
            aria-label={`Notifications${alertCount > 0 ? ` (${alertCount} unread)` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
            className="relative p-2 rounded-md transition-colors"
            style={{
              color: notifOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: notifOpen ? 'rgba(255,255,255,0.07)' : 'transparent',
            }}
          >
            <Bell size={16} />
            {alertCount > 0 && (
              <span
                className="absolute top-1 right-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ width: 15, height: 15, background: 'var(--accent-red)', color: 'white', lineHeight: 1 }}
              >
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div style={{ ...panelBase, width: 348 }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                  {unacked.length > 0 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                      {unacked.length}
                    </span>
                  )}
                </div>
                <button onClick={() => setNotifOpen(false)} className="p-1 rounded transition-colors" style={{ color: 'var(--text-muted)' }} aria-label="Close">
                  <X size={13} />
                </button>
              </div>

              <div className="overflow-y-auto scrollbar-thin" style={{ maxHeight: 300 }}>
                {unacked.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Bell size={20} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>No new notifications</p>
                  </div>
                ) : (
                  unacked.slice(0, 6).map(alert => {
                    const color = alert.severity === 'critical' ? '#EF4444' : alert.severity === 'warning' ? '#F59E0B' : '#3B82F6';
                    return (
                      <div
                        key={alert.id}
                        role="button"
                        tabIndex={0}
                        className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onClick={() => { onNavChange('alerts'); setNotifOpen(false); }}
                        onKeyDown={e => e.key === 'Enter' && (onNavChange('alerts'), setNotifOpen(false))}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <AlertTriangle size={13} style={{ color, flexShrink: 0, marginTop: 3 }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
                              {alert.machine_name}
                            </span>
                            <span className="text-[11px] flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {timeAgo(alert.created_at ?? new Date().toISOString())}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {alert.message}
                          </p>
                        </div>
                        {onAcknowledgeAlert && (
                          <button
                            onClick={e => { e.stopPropagation(); onAcknowledgeAlert(alert.id); }}
                            className="p-1 rounded flex-shrink-0 mt-0.5 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            title="Dismiss"
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {unacked.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {onAcknowledgeAlert && (
                    <button
                      onClick={() => unacked.forEach(a => onAcknowledgeAlert(a.id))}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => { onNavChange('alerts'); setNotifOpen(false); }}
                    className="flex items-center gap-1 text-xs font-medium ml-auto transition-opacity"
                    style={{ color: 'var(--accent-blue)' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    View all <ArrowRight size={11} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plan badge */}
        {subscription && (
          <span
            className="hidden lg:inline text-[10px] font-medium px-2 py-1 rounded-md ml-0.5"
            style={{
              background: subscription.plan === 'free' ? 'rgba(71,85,105,0.15)' : 'rgba(59,130,246,0.1)',
              color: subscription.plan === 'free' ? '#64748B' : 'var(--accent-blue)',
            }}
          >
            {subscription.plan}
          </span>
        )}

        {/* User dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => { setDropdownOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors"
            style={{ background: dropdownOpen ? 'rgba(255,255,255,0.07)' : 'transparent' }}
          >
            <div
              className="flex items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ width: 26, height: 26, background: '#2563EB', color: 'white' }}
            >
              {initials}
            </div>
            <span className="hidden sm:block text-[13px] max-w-[100px] truncate" style={{ color: 'var(--text-secondary)' }}>
              {businessName}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          {dropdownOpen && (
            <div style={{ ...panelBase, width: 200 }}>
              <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{businessName}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{profile?.email ?? 'demo@vendsmart.app'}</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { onNavChange('settings'); setDropdownOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-[13px] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Settings size={13} /> Settings & Billing
                </button>
                {!isDemoMode && (
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-[13px] transition-colors"
                    style={{ color: '#EF4444' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
