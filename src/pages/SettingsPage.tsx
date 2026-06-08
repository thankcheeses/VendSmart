import { useState } from 'react';
import { Check, Zap, Shield, CreditCard, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    limit: '5 machines',
    features: ['Up to 5 machines', 'Real-time alerts', 'Revenue analytics', 'Restock map', 'AI predictions (basic)'],
    color: '#64748B',
    cta: 'Current plan',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/month',
    limit: 'Unlimited machines',
    features: ['Unlimited machines', 'Advanced AI restocking', 'Route optimization', 'CSV/PDF exports', 'Priority support', 'Custom alerts'],
    color: '#3B82F6',
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    limit: 'Custom',
    features: ['Everything in Pro', 'White-label dashboard', 'Dedicated account manager', 'Custom integrations', 'SLA guarantees', 'SSO / SAML'],
    color: '#22D3EE',
    cta: 'Contact sales',
  },
];

export default function SettingsPage() {
  const { profile, subscription, isDemoMode } = useAuth();
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState(profile?.business_name ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpgrade = (plan: string) => {
    if (isDemoMode) {
      alert('Connect Supabase first to enable billing. See DEPLOYMENT.md for setup instructions.');
      return;
    }
    alert(`Stripe checkout for ${plan} plan — integrate with your Stripe account (see DEPLOYMENT.md).`);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Settings & Billing</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your account, plan, and preferences.</p>
      </div>

      {/* Profile */}
      <div className="glass-card space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} style={{ color: 'var(--accent-blue)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Account</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Business Name</label>
            <input
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-blue)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              value={profile?.email ?? 'demo@vendsmart.app'}
              disabled
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5">
            {saved ? <><Check size={14} /> Saved</> : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Current plan summary */}
      {subscription && (
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} style={{ color: 'var(--accent-blue)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Current Plan</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold capitalize" style={{ color: 'var(--text-primary)' }}>{subscription.plan}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: subscription.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: subscription.status === 'active' ? '#22C55E' : '#EF4444',
                    border: `1px solid ${subscription.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}
                >
                  {subscription.status}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {subscription.machine_limit === -1 ? 'Unlimited machines' : `Up to ${subscription.machine_limit} machines`}
                {subscription.current_period_end && ` · Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
              </p>
            </div>
            {subscription.plan === 'free' && (
              <button onClick={() => handleUpgrade('pro')} className="btn-primary flex items-center gap-1.5">
                <Zap size={14} /> Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => {
            const isCurrent = subscription?.plan === plan.key;
            return (
              <div
                key={plan.key}
                className="glass-card relative flex flex-col"
                style={{
                  border: plan.highlight ? `1px solid rgba(59,130,246,0.3)` : '1px solid var(--border-subtle)',
                  background: plan.highlight ? 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(12,12,22,0.95) 100%)' : undefined,
                }}
              >
                {plan.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #22D3EE)', color: 'white' }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={14} style={{ color: plan.color }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.name}</span>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                </div>
                <div className="text-xs mb-4" style={{ color: plan.color }}>{plan.limit}</div>
                <div className="space-y-2 flex-1 mb-5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={12} style={{ color: plan.color, flexShrink: 0 }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => !isCurrent && handleUpgrade(plan.key)}
                  disabled={isCurrent}
                  className={isCurrent ? 'btn-secondary w-full' : 'btn-primary w-full'}
                  style={{ opacity: isCurrent ? 0.6 : 1, cursor: isCurrent ? 'default' : 'pointer' }}
                >
                  {isCurrent ? <><Check size={13} /> {plan.cta}</> : plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} style={{ color: 'var(--accent-blue)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Security</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Last changed — unknown</div>
            </div>
            <button className="btn-secondary text-xs">Change password</button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Two-factor authentication</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add an extra layer of security</div>
            </div>
            <button className="btn-secondary text-xs">Enable 2FA</button>
          </div>
        </div>
      </div>
    </div>
  );
}
