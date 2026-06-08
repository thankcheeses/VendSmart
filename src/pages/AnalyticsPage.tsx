import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import MetricCard from '@/components/shared/MetricCard';

const tabOptions = ['30-Day Revenue', 'Product Performance', 'Fleet Efficiency'];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('30-Day Revenue');
  const { dailyRevenue, productPerformance } = useAnalytics();

  const totalRevenue = dailyRevenue.reduce((sum, d) => sum + d.total, 0);
  const avgDaily = dailyRevenue.length ? Math.round(totalRevenue / dailyRevenue.length) : 0;
  const bestDay = dailyRevenue.length ? dailyRevenue.reduce((a, b) => (a.total > b.total ? a : b)) : null;
  const topProducts = [...productPerformance].sort((a, b) => b.revenue_7d - a.revenue_7d);
  const underperforming = productPerformance.filter(p => p.units_sold_7d < 45);

  const tooltipStyle = { background: 'rgba(15,15,22,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, backdropFilter: 'blur(12px)' };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="30-Day Revenue" value={`$${totalRevenue.toLocaleString()}`} subtitle="all machines" change={12.3} accentColor="green" icon={<DollarSign size={16} />} />
        <MetricCard label="Avg. Daily Revenue" value={`$${avgDaily}`} subtitle="per day" change={8.7} accentColor="blue" icon={<TrendingUp size={16} />} />
        <MetricCard label="Best Day" value={bestDay ? `$${bestDay.total}` : '—'} subtitle={bestDay?.date ?? 'N/A'} change={0} accentColor="cyan" icon={<TrendingUp size={16} />} />
        <MetricCard label="Products Below Target" value={underperforming.length} subtitle="need attention" change={-15} accentColor="amber" icon={<TrendingDown size={16} />} />
      </div>

      <div className="flex gap-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {tabOptions.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-4 py-2.5 text-sm font-medium transition-colors"
            style={{ color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: 'var(--accent-cyan)' }} />
            )}
          </button>
        ))}
      </div>

      {activeTab === '30-Day Revenue' && (
        <div className="glass-card">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Trend — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={dailyRevenue}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="drinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2} /><stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="snackGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#94A3B8', fontSize: 12 }} itemStyle={{ fontSize: 12 }} formatter={(value: number) => [`$${value}`, '']} />
              <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} fill="url(#totalGrad)" name="Total" />
              <Area type="monotone" dataKey="drink" stroke="#22D3EE" strokeWidth={1.5} fill="url(#drinkGrad)" name="Drink" />
              <Area type="monotone" dataKey="snack" stroke="#22C55E" strokeWidth={1.5} fill="url(#snackGrad)" name="Snack" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 justify-center">
            {[{ label: 'Total', color: '#3B82F6' }, { label: 'Drink', color: '#22D3EE' }, { label: 'Snack', color: '#22C55E' }, { label: 'Combo', color: '#F59E0B' }].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="rounded-full" style={{ width: 8, height: 8, background: item.color }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Product Performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass-card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Products by Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="product_name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
                <Bar dataKey="revenue_7d" radius={[0, 4, 4, 0]}>
                  {topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : index === 1 ? '#22D3EE' : index === 2 ? '#22C55E' : 'rgba(59,130,246,0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Products Needing Attention</h3>
            <div className="space-y-3">
              {underperforming.map(p => (
                <div key={p.product_id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <Package size={14} style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.product_name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.category} · {p.units_sold_7d} sold this week</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>${p.revenue_7d.toFixed(2)}</div>
                    <div className="text-xs" style={{ color: 'var(--accent-amber)' }}>Below target</div>
                  </div>
                </div>
              ))}
              {underperforming.length === 0 && (
                <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>All products performing well</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Fleet Efficiency' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="glass-card lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue per Machine Type</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[{ type: 'Snack', avgRev: 248, machines: 5 }, { type: 'Drink', avgRev: 312, machines: 4 }, { type: 'Combo', avgRev: 289, machines: 3 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="type" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [name === 'avgRev' ? `$${value}` : value, name === 'avgRev' ? 'Avg Revenue' : 'Machines']} />
                <Bar dataKey="avgRev" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {[
              { value: '78%', label: 'Fleet Uptime', color: 'var(--accent-cyan)' },
              { value: '4.2', label: 'Avg. Days Between Restock', color: 'var(--accent-green)' },
              { value: '$91', label: 'Avg. Revenue / Machine / Week', color: 'var(--accent-blue)' },
            ].map(({ value, label, color }) => (
              <div key={label} className="glass-card text-center py-6">
                <div className="text-3xl font-bold" style={{ color }}>{value}</div>
                <div className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
