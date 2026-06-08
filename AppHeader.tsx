import { Bell, Search } from 'lucide-react';
import VendingMachineIcon from '@/components/shared/VendingMachineIcon';
import { currentUser } from '@/data/mockData';

interface AppHeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'machines', label: 'Machines' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'alerts', label: 'Alerts' },
];

export default function AppHeader({ activeNav, onNavChange }: AppHeaderProps) {
  const initials = currentUser.business_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6"
      style={{
        height: 56,
        background: 'rgba(5, 5, 8, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <VendingMachineIcon size={20} color="#3B82F6" />
        <span
          className="text-lg font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          VendSmart
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavChange(item.key)}
              className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
              style={{
                color: isActive
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.target as HTMLElement).style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.target as HTMLElement).style.color =
                    'var(--text-secondary)';
              }}
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

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.color = 'var(--text-secondary)')
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.color = 'var(--text-muted)')
          }
        >
          <Search size={16} />
        </button>
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.color = 'var(--text-secondary)')
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.color = 'var(--text-muted)')
          }
        >
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 rounded-full"
            style={{
              width: 6,
              height: 6,
              background: 'var(--accent-red)',
            }}
          />
        </button>
        <div
          className="flex items-center justify-center rounded-full text-xs font-semibold"
          style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #3B82F6, #22D3EE)',
            color: 'white',
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
