import { Package, TrendingUp, DollarSign, Wrench, ChevronRight } from 'lucide-react';
import type { Machine } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import Sparkline from '@/components/shared/Sparkline';
import ProgressBar from '@/components/shared/ProgressBar';
import { getMachineProducts, getMachineSparkline } from '@/data/mockData';

interface MachineDetailPanelProps {
  machine: Machine;
}

export default function MachineDetailPanel({ machine }: MachineDetailPanelProps) {
  const products = getMachineProducts(machine.id);
  const sparklineData = getMachineSparkline(machine.id);
  const topProduct = products.reduce((a, b) => (a.units_sold_7d > b.units_sold_7d ? a : b), products[0]);

  return (
    <div className="glass-card space-y-5">
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{machine.name}</h3>
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{machine.location_address}</p>
        <StatusBadge status={machine.status} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { value: `${machine.fill_percentage}%`, label: 'Fill Rate' },
          { value: `$${machine.weekly_revenue}`, label: 'Weekly Sales' },
          { value: topProduct?.product_name?.length > 12 ? topProduct.product_name.slice(0, 12) + '…' : (topProduct?.product_name ?? '—'), label: 'Top Product' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
            <div className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>7-Day Revenue Trend</div>
        <Sparkline data={sparklineData} width={220} height={40} color="#22D3EE" />
      </div>

      <div>
        <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Product Stock</div>
        <div className="space-y-3">
          {products.slice(0, 5).map((p) => (
            <div key={p.product_id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.product_name}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.units_sold_7d} sold · {p.stock_remaining} left</span>
              </div>
              <ProgressBar percentage={Math.round((p.stock_remaining / (p.stock_remaining + p.units_sold_7d)) * 100)} width="100%" height={4} />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {[
          { Icon: Package, label: 'Type', value: machine.machine_type },
          { Icon: TrendingUp, label: 'Capacity', value: `${machine.capacity_slots} slots` },
          { Icon: DollarSign, label: 'Commission', value: `${machine.commission_percent}%` },
          { Icon: Wrench, label: 'Last Visit', value: machine.last_visit_date },
        ].map(({ Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Icon size={12} /> {label}
            </span>
            <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button className="btn-primary flex-1 flex items-center justify-center gap-1">
          <Wrench size={14} /> Restock Now
        </button>
        <button className="btn-secondary flex items-center justify-center gap-1">
          Details <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
