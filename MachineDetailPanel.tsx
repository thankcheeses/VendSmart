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
  const topProduct = products.reduce((a, b) =>
    a.units_sold_7d > b.units_sold_7d ? a : b
  );

  return (
    <div className="glass-card space-y-5">
      {/* Header */}
      <div>
        <h3
          className="text-base font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {machine.name}
        </h3>
        <p
          className="text-sm mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {machine.location_address}
        </p>
        <StatusBadge status={machine.status} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {machine.fill_percentage}%
          </div>
          <div
            className="text-xs font-medium uppercase tracking-wider mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Fill Rate
          </div>
        </div>
        <div className="text-center">
          <div
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            ${machine.weekly_revenue}
          </div>
          <div
            className="text-xs font-medium uppercase tracking-wider mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Weekly Sales
          </div>
        </div>
        <div className="text-center">
          <div
            className="text-sm font-bold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {topProduct.product_name.length > 12
              ? topProduct.product_name.slice(0, 12) + '...'
              : topProduct.product_name}
          </div>
          <div
            className="text-xs font-medium uppercase tracking-wider mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Top Product
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div>
        <div
          className="text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          7-Day Revenue Trend
        </div>
        <Sparkline data={sparklineData} width={220} height={40} color="#22D3EE" />
      </div>

      {/* Product breakdown */}
      <div>
        <div
          className="text-xs font-medium uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Product Stock
        </div>
        <div className="space-y-3">
          {products.slice(0, 5).map((p) => (
            <div key={p.product_id}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {p.product_name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {p.units_sold_7d} sold · {p.stock_remaining} left
                </span>
              </div>
              <ProgressBar
                percentage={Math.round(
                  (p.stock_remaining / (p.stock_remaining + p.units_sold_7d)) * 100
                )}
                width={180}
                height={4}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Machine info */}
      <div
        className="pt-3 space-y-2"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Package size={12} />
            Type
          </span>
          <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
            {machine.machine_type}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <TrendingUp size={12} />
            Capacity
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {machine.capacity_slots} slots
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <DollarSign size={12} />
            Commission
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {machine.commission_percent}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Wrench size={12} />
            Last Visit
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {machine.last_visit_date}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button className="btn-primary flex-1 flex items-center justify-center gap-1">
          <Wrench size={14} />
          Restock Now
        </button>
        <button className="btn-secondary flex items-center justify-center gap-1">
          Details
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
