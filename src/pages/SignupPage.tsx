import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Check, Zap } from 'lucide-react';
import VendingMachineIcon from '@/components/shared/VendingMachineIcon';
import { useAuth } from '@/contexts/AuthContext';

const planPerks = [
  'Up to 5 machines free forever',
  'Real-time alerts & notifications',
  'Revenue analytics dashboard',
  'AI-powered restocking predictions',
  'Restock map & route planning',
];

export default function SignupPage() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError(null);
    const { error: err } = await signUp(email, password, businessName);
    if (err) { setError(err); setLoading(false); }
    else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }
  };

  if (success) {
    return (
      <div className="auth-bg min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <Check size={28} style={{ color: '#22C55E' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>You're all set!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Your account has been created. Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg min-h-screen flex">
      {/* Left — plan info */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16" style={{ width: '46%', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <VendingMachineIcon size={22} color="#3B82F6" />
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>VendSmart</span>
        </div>

        <div>
          <div
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <Check size={11} /> Free plan — no credit card needed
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Start managing your fleet<br />
            <span className="gradient-text">for free today.</span>
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Get started with up to 5 machines at no cost. Upgrade anytime for unlimited machines and advanced features.
          </p>

          <div className="glass-card space-y-3">
            <div className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Free plan includes:</div>
            {planPerks.map(perk => (
              <div key={perk} className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <Check size={9} style={{ color: '#22C55E' }} />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          By signing up you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <VendingMachineIcon size={20} color="#3B82F6" />
            <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>VendSmart</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Free forever for up to 5 machines</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            {[
              { label: 'Business name', value: businessName, setter: setBusinessName, placeholder: 'Acme Vending Co.', type: 'text' },
              { label: 'Email address', value: email, setter: setEmail, placeholder: 'you@example.com', type: 'email' },
            ].map(({ label, value, setter, placeholder, type }) => (
              <div key={label}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent-blue)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>Sign in</Link>
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>Or try without signing up</div>
            <Link to="/" className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 text-sm">
              <Zap size={14} /> Explore demo dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
