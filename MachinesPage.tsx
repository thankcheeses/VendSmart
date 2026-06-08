import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, MapPin, Cpu, Calendar } from 'lucide-react';
import type { Machine, MachineType } from '@/types';
import { machines as initialMachines } from '@/data/mockData';
import StatusBadge from '@/components/shared/StatusBadge';
import ProgressBar from '@/components/shared/ProgressBar';

const MACHINE_TYPES: MachineType[] = ['snack', 'drink', 'combo'];

export default function MachinesPage() {
  const [machineList, setMachineList] = useState<Machine[]>(initialMachines);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location_address: '',
    machine_type: 'snack' as MachineType,
    capacity_slots: 40,
    commission_percent: 10,
  });

  const filtered = machineList.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      location_address: '',
      machine_type: 'snack',
      capacity_slots: 40,
      commission_percent: 10,
    });
    setEditingMachine(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location_address) return;

    if (editingMachine) {
      setMachineList((prev) =>
        prev.map((m) =>
          m.id === editingMachine.id
            ? { ...m, ...formData, capacity_slots: Number(formData.capacity_slots) }
            : m
        )
      );
    } else {
      const newMachine: Machine = {
        id: `m${Date.now()}`,
        user_id: 'user-1',
        name: formData.name,
        location_address: formData.location_address,
        latitude: 40.73 + (Math.random() - 0.5) * 0.1,
        longitude: -73.95 + (Math.random() - 0.5) * 0.1,
        machine_type: formData.machine_type,
        capacity_slots: Number(formData.capacity_slots),
        commission_percent: Number(formData.commission_percent),
        status: 'online',
        fill_percentage: 100,
        weekly_revenue: 0,
        last_visit_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString().split('T')[0],
      };
      setMachineList((prev) => [...prev, newMachine]);
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setMachineList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      name: machine.name,
      location_address: machine.location_address,
      machine_type: machine.machine_type,
      capacity_slots: machine.capacity_slots,
      commission_percent: machine.commission_percent,
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Machine Registry
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {machineList.length} machines registered
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus size={14} />
          Add Machine
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search machines by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="glass-elevated p-5 space-y-4">
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {editingMachine ? 'Edit Machine' : 'Add New Machine'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Machine Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Midtown Snack #3"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Location Address *
              </label>
              <input
                type="text"
                value={formData.location_address}
                onChange={(e) =>
                  setFormData({ ...formData, location_address: e.target.value })
                }
                placeholder="e.g., 451 Lexington Ave, New York, NY"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Machine Type
              </label>
              <select
                value={formData.machine_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    machine_type: e.target.value as MachineType,
                  })
                }
                className="w-full px-3 py-2 rounded-lg text-sm outline-none capitalize"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {MACHINE_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Capacity (slots)
              </label>
              <input
                type="number"
                value={formData.capacity_slots}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity_slots: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Commission %
              </label>
              <input
                type="number"
                value={formData.commission_percent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission_percent: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              {editingMachine ? 'Save Changes' : 'Add Machine'}
            </button>
          </div>
        </div>
      )}

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((machine) => (
          <div
            key={machine.id}
            className="glass-card space-y-3 group"
            style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4
                  className="text-sm font-semibold truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {machine.name}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} style={{ color: 'var(--text-muted)' }} />
                  <span
                    className="text-xs truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {machine.location_address}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(machine)}
                  className="p-1.5 rounded"
                  style={{ color: 'var(--text-muted)' }}
                  title="Edit"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(machine.id)}
                  className="p-1.5 rounded"
                  style={{ color: 'var(--accent-red)' }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={machine.status} />
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <Cpu size={11} />
                {machine.machine_type}
              </span>
            </div>

            <ProgressBar percentage={machine.fill_percentage} />

            <div
              className="flex items-center justify-between pt-2"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <div>
                <div
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  ${machine.weekly_revenue}
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  weekly revenue
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {machine.capacity_slots} slots
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Calendar size={10} style={{ color: 'var(--text-muted)' }} />
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {machine.last_visit_date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card text-center py-16">
          <Cpu size={36} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
          <p
            className="mt-3 text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            No machines found
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Try adjusting your search query
          </p>
        </div>
      )}
    </div>
  );
}
