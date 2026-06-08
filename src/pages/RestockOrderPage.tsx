import { useState } from 'react';
import {
  ShoppingCart, Package, AlertTriangle, CheckCircle, Truck, Clock,
  Trash2, Plus, Minus, ExternalLink, ChevronDown, ChevronUp, Zap,
  Link2, Link2Off, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRestock } from '@/hooks/useRestock';
import type { RestockQueueItem, RestockOrderLineItem, SupplierName } from '@/types';

const SUPPLIER_META: Record<SupplierName, { label: string; logo: string; description: string; helpUrl: string }> = {
  amazon_business: { label: 'Amazon Business', logo: 'AB', description: 'Millions of SKUs, next-day delivery, real-time pricing via Ordering API.', helpUrl: 'https://business.amazon.com' },
  sysco: { label: 'Sysco', description: 'Food-grade distribution, 30,000+ SKUs, scheduled delivery windows.', logo: 'SY', helpUrl: 'https://www.sysco.com' },
  sams_club: { label: "Sam's Club Business", description: "Bulk wholesale, snacks & beverages, direct API — no EDI required.", logo: 'SC', helpUrl: 'https://www.samsclub.com' },
  walmart_business: { label: 'Walmart Business', description: 'Broad SKU coverage, next-day delivery, competitive bulk pricing.', logo: 'WB', helpUrl: 'https://business.walmart.com' },
  manual: { label: 'Manual / Local Distributor', description: 'Generate a PDF purchase order to send to your local distributor.', logo: 'MN', helpUrl: '' },
};

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: '#64748B', icon: <Clock size={12} /> },
  submitted: { label: 'Submitted', color: '#3B82F6', icon: <Package size={12} /> },
  confirmed: { label: 'Confirmed', color: '#8B5CF6', icon: <CheckCircle size={12} /> },
  shipped: { label: 'Shipped', color: '#F59E0B', icon: <Truck size={12} /> },
  delivered: { label: 'Delivered', color: '#22C55E', icon: <CheckCircle size={12} /> },
  cancelled: { label: 'Cancelled', color: '#EF4444', icon: <X size={12} /> },
};

function UrgencyBadge({ urgency, days }: { urgency: 'critical' | 'warning'; days: number }) {
  const critical = urgency === 'critical';
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{
        background: critical ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
        color: critical ? '#EF4444' : '#F59E0B',
        border: `1px solid ${critical ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
      }}
    >
      <AlertTriangle size={10} />
      {days < 1 ? '< 1 day' : `${days}d`}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: `${meta.color}1a`, color: meta.color, border: `1px solid ${meta.color}33` }}
    >
      {meta.icon} {meta.label}
    </span>
  );
}

function FillBar({ pct }: { pct: number }) {
  const color = pct < 25 ? '#EF4444' : pct < 50 ? '#F59E0B' : '#22C55E';
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] w-7 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function RestockOrderPage() {
  const { restockQueue, orders, draftItems, draftTotal, suppliers, loading, addToDraft, removeFromDraft, updateDraftQty, clearDraft, submitOrder } = useRestock();
  const [submitting, setSubmitting] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [connectingSupplier, setConnectingSupplier] = useState<SupplierName | null>(null);

  const handleAddToOrder = (item: RestockQueueItem) => {
    const lineItem: RestockOrderLineItem = {
      product_id: item.product_id,
      product_name: item.product_name,
      machine_name: item.machine_name,
      qty_ordered: item.recommended_qty,
      unit_price: item.estimated_cost / item.recommended_qty,
      total_price: item.estimated_cost,
      supplier: item.preferred_supplier,
    };
    addToDraft(lineItem);
    toast.success(`Added ${item.machine_name} to order`);
  };

  const handleQuickReorderAll = () => {
    const critical = restockQueue.filter(i => i.urgency === 'critical');
    if (critical.length === 0) { toast.info('No critical items to reorder'); return; }
    critical.forEach(item => handleAddToOrder(item));
    toast.success(`Added ${critical.length} critical items to order`);
  };

  const handleSubmit = async () => {
    if (draftItems.length === 0) { toast.error('Add items to the order first'); return; }
    setSubmitting(true);
    const { error } = await submitOrder();
    setSubmitting(false);
    if (error) toast.error(error);
    else toast.success('Order submitted successfully');
  };

  const toggleOrder = (id: string) => {
    setExpandedOrders(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const criticalCount = restockQueue.filter(i => i.urgency === 'critical').length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Smart Reorder</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            AI-predicted restock queue · order directly from your connected suppliers
          </p>
        </div>
        {criticalCount > 0 && (
          <button
            onClick={handleQuickReorderAll}
            className="btn-primary flex items-center gap-1.5 flex-shrink-0"
          >
            <Zap size={14} /> Quick Order ({criticalCount} critical)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Left column: queue + history */}
        <div className="space-y-6">

          {/* Restock Queue */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} style={{ color: 'var(--accent-amber)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Restock Queue</h3>
                {restockQueue.length > 0 && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                    {restockQueue.length} machines
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sorted by urgency</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            ) : restockQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle size={24} style={{ color: '#22C55E' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All machines stocked</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No machines below 65% fill level</p>
              </div>
            ) : (
              <div className="space-y-2">
                {restockQueue.map(item => (
                  <div
                    key={`${item.machine_id}-${item.product_id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {item.machine_name}
                        </span>
                        <UrgencyBadge urgency={item.urgency} days={item.days_until_stockout} />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <FillBar pct={Math.round((item.current_stock / item.capacity) * 100)} />
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {item.current_stock}/{item.capacity} units · rec. +{item.recommended_qty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        ~${item.estimated_cost.toFixed(2)}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>est. cost</div>
                    </div>
                    <button
                      onClick={() => handleAddToOrder(item)}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md flex-shrink-0 transition-colors"
                      style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; }}
                    >
                      <Plus size={11} /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order History */}
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} style={{ color: 'var(--accent-blue)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Order History</h3>
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-secondary)' }}>No orders yet</p>
            ) : (
              <div className="space-y-2">
                {orders.map(order => {
                  const expanded = expandedOrders.has(order.id);
                  return (
                    <div
                      key={order.id}
                      className="rounded-lg overflow-hidden"
                      style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                        style={{ background: 'rgba(255,255,255,0.025)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                              {SUPPLIER_META[order.supplier as SupplierName]?.label ?? order.supplier}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {order.line_items.length} items · ${order.order_total.toFixed(2)}
                            {order.submitted_at && ` · ${new Date(order.submitted_at).toLocaleDateString()}`}
                            {order.tracking_number && ` · ${order.tracking_number}`}
                          </div>
                        </div>
                        {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                      </button>
                      {expanded && order.line_items.length > 0 && (
                        <div className="px-3 pb-3 pt-1 space-y-1.5">
                          {order.line_items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                              <span>{item.product_name} — {item.machine_name}</span>
                              <span className="flex-shrink-0 ml-4">×{item.qty_ordered} · ${item.total_price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: draft order + suppliers */}
        <div className="space-y-5">

          {/* Build Order */}
          <div className="glass-elevated">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart size={15} style={{ color: 'var(--accent-blue)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Current Order</h3>
                {draftItems.length > 0 && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)' }}>
                    {draftItems.length}
                  </span>
                )}
              </div>
              {draftItems.length > 0 && (
                <button onClick={clearDraft} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Clear
                </button>
              )}
            </div>

            {draftItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <ShoppingCart size={20} style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                  Add items from the restock queue
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {draftItems.map((item, idx) => (
                    <div key={idx} className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[12px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.product_name}</div>
                          <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{item.machine_name}</div>
                        </div>
                        <button onClick={() => removeFromDraft(item.product_id, item.machine_name)} style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateDraftQty(item.product_id, item.machine_name, Math.max(1, item.qty_ordered - 1))}
                            className="w-5 h-5 rounded flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
                          >
                            <Minus size={9} />
                          </button>
                          <span className="text-xs w-8 text-center" style={{ color: 'var(--text-primary)' }}>{item.qty_ordered}</span>
                          <button
                            onClick={() => updateDraftQty(item.product_id, item.machine_name, item.qty_ordered + 1)}
                            className="w-5 h-5 rounded flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                        <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                          ${item.total_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Order Total</span>
                  <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>${draftTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? 'Submitting…' : 'Submit Order'}
                </button>
                <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                  Connect a supplier above to enable direct submission
                </p>
              </>
            )}
          </div>

          {/* Supplier Connections */}
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Link2 size={15} style={{ color: 'var(--accent-blue)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Supplier Connections</h3>
            </div>

            <div className="space-y-2">
              {(Object.keys(SUPPLIER_META) as SupplierName[]).map(key => {
                const meta = SUPPLIER_META[key];
                const integration = suppliers.find(s => s.supplier_name === key);
                const connected = integration?.status === 'connected';
                const isConnecting = connectingSupplier === key;

                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${connected ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)'}` }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: connected ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)', color: connected ? '#22C55E' : 'var(--text-muted)' }}
                    >
                      {meta.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{meta.label}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {connected ? (
                          <span style={{ color: '#22C55E' }}>Connected{integration?.last_sync_at ? ` · synced ${new Date(integration.last_sync_at).toLocaleDateString()}` : ''}</span>
                        ) : (
                          meta.description.split('.')[0]
                        )}
                      </div>
                    </div>
                    {connected ? (
                      <Link2 size={13} style={{ color: '#22C55E', flexShrink: 0 }} />
                    ) : key === 'manual' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>Default</span>
                    ) : (
                      <button
                        onClick={() => {
                          setConnectingSupplier(isConnecting ? null : key);
                        }}
                        className="text-[11px] font-medium px-2 py-1 rounded-md flex-shrink-0 flex items-center gap-1 transition-colors"
                        style={{ background: isConnecting ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}
                      >
                        <Link2Off size={10} /> Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {connectingSupplier && connectingSupplier !== 'manual' && (
              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    Connect {SUPPLIER_META[connectingSupplier].label}
                  </span>
                  <button onClick={() => setConnectingSupplier(null)} style={{ color: 'var(--text-muted)' }}>
                    <X size={12} />
                  </button>
                </div>
                <p className="text-[11px] mb-2.5" style={{ color: 'var(--text-secondary)' }}>
                  {connectingSupplier === 'amazon_business' && 'You\'ll need an Amazon Business account and API credentials from your Amazon Business developer console.'}
                  {connectingSupplier === 'sysco' && 'You\'ll need a Sysco account number and API key from the Sysco APIC Developer Portal.'}
                  {connectingSupplier === 'sams_club' && "You'll need a Sam's Club Business membership and API credentials from the Sam's Club developer portal."}
                  {connectingSupplier === 'walmart_business' && "You'll need a Walmart Business account and supplier API credentials."}
                </p>
                <a
                  href={SUPPLIER_META[connectingSupplier].helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  Set up account <ExternalLink size={10} />
                </a>
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                  Supplier credentials are stored encrypted. Set <code>SUPABASE_SERVICE_ROLE_KEY</code> in your environment to enable live price fetching.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
