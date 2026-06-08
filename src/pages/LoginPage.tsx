import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Zap, BarChart2, Bell, Map } from 'lucide-react';
import VendingMachineIcon from '@/components/shared/VendingMachineIcon';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  { icon: BarChart2, label: 'Real-time analytics', desc: 'Revenue, fill rates, and trends at a glance' },
  { icon: Bell, label: 'Smart alerts', desc: 'AI-powered restocking predictions before stockouts' },
  { icon: Map, label: 'Fleet map', desc: 'Visual priority queue for your restock routes' },
  { icon: Zap, label: 'Instant sync', desc: 'Live updates across all your machines' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email, password);
    if (err) { setError(err); setLoading(false); }
    else navigate('/');
  };

  return (
    <div className="auth-bg min-h-screen flex">
      {/* Left panel — marketing */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16" style={{ width: '46%', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <VendingMachineIcon size={22} color="#3B82F6" />
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>VendSmart</span>
        </div>

        <div>
          <h1 className="text-4xl xl:text-5xl font-bold mb-5 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Manage your<br />
            <span className="gradient-text">vending fleet</span><br />
            with confidence.
          </h1>
          <p className="text-base mb-10" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            VendSmart gives operators real-time visibility, AI-powered restocking, and smart analytics — all in one dashboard.
          </p>

          <div className="space-y-5">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 36, height: 36, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  <Icon size={16} style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {[{ n: '500+', l: 'Operators' }, { n: '12k+', l: 'Machines managed' }, { n: '99.9%', l: 'Uptime' }].map(({ n, l }) => (
            <div key={l}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{n}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <VendingMachineIcon size={20} color="#3B82F6" />
            <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>VendSmart</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent-blue)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent-blue)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>Create one free</Link>
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>Or try the demo</div>
            <Link
              to="/"
              className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              <Zap size={14} /> Explore demo dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
