import { useState, useEffect } from 'react';
import { Shield, Users, DollarSign, Server, ChevronRight, Eye, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isDemoMode } from '@/lib/supabase';
import type { AdminTenant, PlanType } from '@/types';

const PLAN_COLOR: Record<PlanType, string> = {
  free: '#64748B',
  operator: '#3B82F6',
  pro: '#8B5CF6',
  business: '#22D3EE',
  enterprise: '#F59E0B',
};

const MACHINE_LIMITS: Record<PlanType, number> = {
  free: 5,
  operator: 25,
  pro: 100,
  business: -1,
  enterprise: -1,
};

const mockTenants: AdminTenant[] = [
  { user_id: 'u1', business_name: 'Metro Vend Co.', email: 'ops@metrovend.com', plan: 'pro', plan_status: 'active', machine_count: 47, weekly_revenue: 4320, machine_limit: 100, joined_at: '2024-11-12', last_active: '2025-06-07' },
  { user_id: 'u2', business_name: 'QuickRefresh LLC', email: 'admin@quickrefresh.io', plan: 'operator', plan_status: 'active', machine_count: 18, weekly_revenue: 1890, machine_limit: 25, joined_at: '2025-01-03', last_active: '2025-06-08' },
  { user_id: 'u3', business_name: 'Campus Eats', email: 'vendor@campuseats.edu', plan: 'free', plan_status: 'active', machine_count: 4, weekly_revenue: 340, machine_limit: 5, joined_at: '2025-03-19', last_active: '2025-06-05' },
  { user_id: 'u4', business_name: 'Vend Solutions Inc.', email: 'billing@vendsolutions.com', plan: 'business', plan_status: 'active', machine_count: 212, weekly_revenue: 19440, machine_limit: -1, joined_at: '2024-09-01', last_active: '2025-06-08' },
  { user_id: 'u5', business_name: 'SnackStop', email: 'owner@snackstop.co', plan: 'free', plan_status: 'active', machine_count: 5, weekly_revenue: 520, machine_limit: 5, joined_at: '2025-05-11', last_active: '2025-06-06' },
  { user_id: 'u6', business_name: 'Automated Refreshments', email: 'ops@autorefresh.net', plan: 'pro', plan_status: 'past_due', machine_count: 63, weekly_revenue: 5810, machine_limit: 100, joined_at: '2024-07-22', last_active: '2025-05-30' },
  { user_id: 'u7', business_name: 'GreenBreak Vending', email: 'hello@greenbreak.com', plan: 'operator', plan_status: 'active', machine_count: 11, weekly_revenue: 980, machine_limit: 25, joined_at: '2025-02-14', last_active: '2025-06-04' },
  { user_id: 'u8', business_name: 'Elevate Vend', email: 'ceo@elevatevend.com', plan: 'enterprise', plan_status: 'active', machine_count: 340, weekly_revenue: 31200, machine_limit: -1, joined_at: '2024-05-30', last_active: '2025-06-08' },
];

export default function AdminPage() {
  const { profile } = useAuth();
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState<PlanType | 'all'>('all');
  const [impersonating, setImpersonating] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.is_super_admin && !isDemoMode) return;
    loadTenants();
  }, [profile]);

  const loadTenants = async () => {
    setLoading(true);
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 300));
      setTenants(mockTenants);
      setLoading(false);
      return;
    }
    if (!supabase) { setLoading(false); return; }
    try {
      // Join profiles + subscriptions, aggregate machines
      const { data: rows, error } = await supabase
        .from('profiles')
        .select(`
          id,
          business_name,
          email,
          created_at,
          subscriptions (plan, status, machine_limit),
          machines (weekly_revenue)
        `);

      if (error) throw error;
      const mapped: AdminTenant[] = (rows ?? []).map((r: {
        id: string;
        business_name: string;
        email: string;
        created_at: string;
        subscriptions: { plan: PlanType; status: string; machine_limit: number }[];
        machines: { weekly_revenue: number }[];
      }) => {
        const sub = r.subscriptions?.[0];
        const machineList = r.machines ?? [];
        return {
          user_id: r.id,
          business_name: r.business_name,
          email: r.email,
          plan: sub?.plan ?? 'free',
          plan_status: (sub?.status as 'active' | 'cancelled' | 'past_due') ?? 'active',
          machine_count: machineList.length,
          weekly_revenue: machineList.reduce((s: number, m: { weekly_revenue: number }) => s + (m.weekly_revenue ?? 0), 0),
          machine_limit: sub?.machine_limit ?? MACHINE_LIMITS[sub?.plan ?? 'free'],
          joined_at: r.created_at.split('T')[0],
        };
      });
      setTenants(mapped);
    } catch (err) {
      toast.error('Failed to load tenants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (tenant: AdminTenant) => {
    if (isDemoMode) {
      toast.info(`Demo: would impersonate "${tenant.business_name}" for 1 hour.`);
      return;
    }
    if (!supabase || !profile) return;
    setImpersonating(tenant.user_id);
    try {
      await supabase.from('admin_impersonation_sessions').insert({
        admin_user_id: profile.id,
        target_user_id: tenant.user_id,
        reason: 'Admin panel review',
      });
      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        action: 'IMPERSONATE',
        resource: 'profile',
        resource_id: tenant.user_id,
        metadata: { target_email: tenant.email, target_plan: tenant.plan },
      });
      toast.success(`Impersonation session started for ${tenant.business_name}`);
    } catch (err) {
      toast.error('Failed to start impersonation session');
    } finally {
      setImpersonating(null);
    }
  };

  const filtered = tenants.filter(t => planFilter === 'all' || t.plan === planFilter);
  const totalMRR = tenants.reduce((s, t) => {
    const mrr: Record<PlanType, number> = { free: 0, operator: 29, pro: 79, business: 199, enterprise: 500 };
    return s + (t.plan_status === 'active' ? (mrr[t.plan] ?? 0) : 0);
  }, 0);
  const totalMachines = tenants.reduce((s, t) => s + t.machine_count, 0);
  const paidTenants = tenants.filter(t => t.plan !== 'free' && t.plan_status === 'active').length;

  if (!profile?.is_super_admin && !isDemoMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Shield size={40} style={{ color: 'var(--accent-red)', marginBottom: 16 }} />
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This page requires super-admin privileges.</p>
      </div>
    );
  }

  const planCounts = tenants.reduce<Record<string, number>>((acc, t) => {
    acc[t.plan] = (acc[t.plan] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} style={{ color: 'var(--accent-blue)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              Super Admin
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Tenant overview, tier distribution, and account management.
          </p>
        </div>
        <button onClick={loadTenants} disabled={loading} className="btn-secondary flex items-center gap-1.5">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total tenants', value: tenants.length, icon: Users, color: 'var(--accent-blue)' },
          { label: 'Paid accounts', value: paidTenants, icon: TrendingUp, color: 'var(--accent-green)' },
          { label: 'Est. MRR', value: `$${totalMRR.toLocaleString()}`, icon: DollarSign, color: 'var(--accent-green)' },
          { label: 'Machines deployed', value: totalMachines, icon: Server, color: 'var(--accent-cyan)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <Icon size={14} style={{ color, opacity: 0.7 }} />
            </div>
            <div className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Plan distribution</h3>
        <div className="flex items-end gap-3">
          {(['free', 'operator', 'pro', 'business', 'enterprise'] as PlanType[]).map(plan => {
            const count = planCounts[plan] ?? 0;
            const pct = tenants.length ? Math.round((count / tenants.length) * 100) : 0;
            return (
              <div key={plan} className="flex-1 text-center">
                <div
                  className="rounded-t-sm mx-auto mb-1 transition-all"
                  style={{
                    width: '100%',
                    height: Math.max(pct * 1.2, count > 0 ? 6 : 2),
                    background: count > 0 ? PLAN_COLOR[plan] : 'var(--border-subtle)',
                    opacity: count > 0 ? 0.7 : 1,
                  }}
                />
                <div className="text-sm font-semibold" style={{ color: count > 0 ? PLAN_COLOR[plan] : 'var(--text-muted)' }}>{count}</div>
                <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{plan}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tenant table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Tenants {planFilter !== 'all' && `· ${planFilter}`} ({filtered.length})
          </h3>
          <div className="flex gap-1">
            {(['all', 'free', 'operator', 'pro', 'business', 'enterprise'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPlanFilter(p as PlanType | 'all')}
                className="px-2.5 py-1 text-xs rounded-md capitalize transition-colors"
                style={{
                  background: planFilter === p ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: planFilter === p ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  border: planFilter === p ? '1px solid rgba(59,130,246,0.25)' : '1px solid var(--border-subtle)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                    {['Business', 'Email', 'Plan', 'Machines', 'Weekly rev.', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[11px] font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tenant => (
                    <tr
                      key={tenant.user_id}
                      className="table-row-hover"
                      style={{ borderBottom: '1px solid var(--border-subtle)', height: 52 }}
                    >
                      <td className="px-4 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {tenant.business_name}
                      </td>
                      <td className="px-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                        {tenant.email}
                      </td>
                      <td className="px-4">
                        <span
                          className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                          style={{
                            background: `${PLAN_COLOR[tenant.plan]}18`,
                            color: PLAN_COLOR[tenant.plan],
                            border: `1px solid ${PLAN_COLOR[tenant.plan]}33`,
                          }}
                        >
                          {tenant.plan}
                          {tenant.plan_status === 'past_due' && <span className="ml-1 text-[10px]" style={{ color: '#EF4444' }}>⚠</span>}
                        </span>
                      </td>
                      <td className="px-4 text-[13px] tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {tenant.machine_count}
                        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                          / {tenant.machine_limit === -1 ? '∞' : tenant.machine_limit}
                        </span>
                      </td>
                      <td className="px-4 text-[13px] font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        ${tenant.weekly_revenue.toLocaleString()}
                      </td>
                      <td className="px-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                        {tenant.joined_at}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleImpersonate(tenant)}
                            disabled={impersonating === tenant.user_id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            title="Impersonate this tenant (1h session, logged)"
                          >
                            <Eye size={11} /> View
                          </button>
                          <button
                            className="p-1.5 rounded-md transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="flex items-center justify-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No tenants match this filter.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isDemoMode && (
        <p className="text-xs text-center pb-2" style={{ color: 'var(--text-muted)' }}>
          Demo mode — showing sample tenant data. In production, this reads live profiles, subscriptions, and machine counts.
        </p>
      )}
    </div>
  );
}
