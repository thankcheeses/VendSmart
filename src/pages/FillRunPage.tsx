import { useState, useCallback } from 'react';
import { Camera, CheckCircle, ChevronDown, Minus, Plus, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useMachines } from '@/hooks/useMachines';
import { isDemoMode, supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SlotEntry {
  slot: number;
  productName: string;
  currentStock: number;
  capacity: number;
  filled: number;
}

function buildDemoSlots(machineId: string, capacity: number): SlotEntry[] {
  const products = [
    'Coca-Cola 20oz', 'Pepsi 20oz', 'Sprite 20oz', 'Water 16oz',
    "Lay's Classic", 'Doritos Nacho', 'Cheetos', 'Pringles',
    'Snickers Bar', 'Kind Bar', 'Clif Bar', 'Reese\'s Cups',
    'Red Bull 12oz', 'Monster Energy', 'Vitamin Water', 'Gatorade',
  ];
  const seed = machineId.charCodeAt(machineId.length - 1);
  const slotCount = Math.min(capacity, 16);
  return Array.from({ length: slotCount }, (_, i) => ({
    slot: i + 1,
    productName: products[(i + seed) % products.length],
    currentStock: Math.floor(Math.random() * 8),
    capacity: 10,
    filled: 0,
  }));
}

export default function FillRunPage() {
  const { machines } = useMachines();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string>(machines[0]?.id ?? '');
  const [slots, setSlots] = useState<SlotEntry[]>(() =>
    machines[0] ? buildDemoSlots(machines[0].id, machines[0].capacity_slots) : []
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const selectedMachine = machines.find(m => m.id === selectedId);

  const selectMachine = useCallback((id: string) => {
    const m = machines.find(m => m.id === id);
    if (!m) return;
    setSelectedId(id);
    setSlots(buildDemoSlots(id, m.capacity_slots));
    setSubmitted(false);
    setSelectorOpen(false);
  }, [machines]);

  const adjustFilled = (slot: number, delta: number) => {
    setSlots(prev => prev.map(s => {
      if (s.slot !== slot) return s;
      const next = Math.max(0, Math.min(s.capacity - s.currentStock, s.filled + delta));
      return { ...s, filled: next };
    }));
  };

  const totalFilled = slots.reduce((sum, s) => sum + s.filled, 0);

  const handleSubmit = async () => {
    if (!selectedMachine) return;
    setSubmitting(true);

    if (!isDemoMode && supabase && user) {
      const transactions = slots
        .filter(s => s.filled > 0)
        .map(s => ({
          user_id: user.id,
          machine_id: selectedId,
          slot_number: s.slot,
          product_name: s.productName,
          units_added: s.filled,
          created_at: new Date().toISOString(),
        }));
      if (transactions.length > 0) {
        const { error } = await supabase.from('inventory_transactions').insert(transactions);
        if (error) {
          toast.error('Failed to save fill run: ' + error.message);
          setSubmitting(false);
          return;
        }
      }
    }

    await new Promise(r => setTimeout(r, isDemoMode ? 600 : 0));
    setSubmitting(false);
    setSubmitted(true);
    toast.success(`Fill run submitted — ${totalFilled} units added to ${selectedMachine.name}`);
  };

  const resetRun = () => {
    setSubmitted(false);
    setSlots(prev => prev.map(s => ({ ...s, filled: 0 })));
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 flex flex-col items-center gap-5 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,212,200,0.12)', border: '1px solid rgba(0,212,200,0.25)' }}
        >
          <CheckCircle size={32} style={{ color: '#00d4c8' }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Fill Run Complete</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {totalFilled} units added to <strong style={{ color: 'var(--text-primary)' }}>{selectedMachine?.name}</strong>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={resetRun} className="btn-secondary">Fill Another Machine</button>
          <button onClick={() => { setSubmitted(false); selectMachine(selectedId); }} className="btn-primary">
            Start New Run
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Machine Selector */}
      <div className="mb-5">
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Fill Run</h2>
        <div className="relative">
          <button
            onClick={() => setSelectorOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 rounded-lg text-sm"
            style={{
              height: 52,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="text-left min-w-0">
              <div className="font-medium truncate">{selectedMachine?.name ?? 'Select machine'}</div>
              {selectedMachine && (
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {selectedMachine.location_address}
                </div>
              )}
            </div>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }} />
          </button>

          {selectorOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              {machines.map(m => (
                <button
                  key={m.id}
                  onClick={() => selectMachine(m.id)}
                  className="w-full text-left px-4 py-3 transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: m.id === selectedId ? 'rgba(0,212,200,0.06)' : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = m.id === selectedId ? 'rgba(0,212,200,0.06)' : 'transparent')}
                >
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.location_address}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slot list */}
      {selectedMachine && (
        <div className="space-y-2">
          {slots.map(slot => {
            const pct = slot.currentStock / slot.capacity;
            const stockColor = pct < 0.2 ? '#EF4444' : pct < 0.4 ? '#F59E0B' : '#8b949e';
            return (
              <div
                key={slot.slot}
                className="glass-card flex items-center gap-4"
                style={{ padding: '12px 16px' }}
              >
                {/* Slot # */}
                <div
                  className="text-xs font-mono font-semibold rounded flex items-center justify-center flex-shrink-0"
                  style={{ width: 28, height: 28, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                >
                  {slot.slot}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {slot.productName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="h-1.5 rounded-full flex-1"
                      style={{ background: 'var(--bg-elevated)', maxWidth: 80 }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(slot.currentStock / slot.capacity) * 100}%`, background: stockColor }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: stockColor }}>
                      {slot.currentStock}/{slot.capacity}
                    </span>
                  </div>
                </div>

                {/* Camera */}
                <button
                  className="p-2 rounded-md flex-shrink-0 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title="Take photo"
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Camera size={15} />
                </button>

                {/* Qty stepper */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => adjustFilled(slot.slot, -1)}
                    disabled={slot.filled === 0}
                    className="flex items-center justify-center rounded-md transition-colors"
                    style={{
                      width: 36, height: 36,
                      background: 'var(--bg-elevated)',
                      color: slot.filled === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Minus size={13} />
                  </button>
                  <span
                    className="text-sm font-semibold text-center"
                    style={{ width: 28, color: slot.filled > 0 ? '#00d4c8' : 'var(--text-muted)' }}
                  >
                    {slot.filled}
                  </span>
                  <button
                    onClick={() => adjustFilled(slot.slot, 1)}
                    disabled={slot.filled >= slot.capacity - slot.currentStock}
                    className="flex items-center justify-center rounded-md transition-colors"
                    style={{
                      width: 36, height: 36,
                      background: slot.filled >= slot.capacity - slot.currentStock ? 'var(--bg-elevated)' : 'rgba(0,212,200,0.1)',
                      color: slot.filled >= slot.capacity - slot.currentStock ? 'var(--text-muted)' : '#00d4c8',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-4 flex items-center justify-between gap-4 z-50"
        style={{
          background: 'rgba(9,9,15,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          {!navigator.onLine && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#F59E0B' }}>
              <WifiOff size={13} /> Offline — will sync on reconnect
            </span>
          )}
          {navigator.onLine && totalFilled > 0 && (
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {totalFilled} unit{totalFilled !== 1 ? 's' : ''} to add
            </span>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || totalFilled === 0}
          className="btn-primary"
          style={{ minWidth: 140, opacity: totalFilled === 0 ? 0.4 : 1 }}
        >
          {submitting ? 'Submitting…' : 'Submit Fill Run'}
        </button>
      </div>
    </div>
  );
}
