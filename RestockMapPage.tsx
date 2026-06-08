import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Wrench, ArrowUpDown } from 'lucide-react';
import { machines } from '@/data/mockData';

// Fix Leaflet default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored markers
function createColoredMarker(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; 
      height: 24px; 
      border-radius: 50%; 
      background: ${color}33;
      border: 2px solid ${color};
      box-shadow: 0 0 8px ${color}66;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const markerColors: Record<string, string> = {
  online: '#22C55E',
  low_stock: '#F59E0B',
  critical: '#EF4444',
  offline: '#64748B',
};

export default function RestockMapPage() {
  const [sortBy, setSortBy] = useState<'urgency' | 'revenue'>('urgency');

  const sortedMachines = useMemo(() => {
    const priority: Record<string, number> = {
      critical: 0,
      offline: 1,
      low_stock: 2,
      online: 3,
    };
    return [...machines].sort((a, b) => {
      if (sortBy === 'urgency') {
        return priority[a.status] - priority[b.status];
      }
      return b.weekly_revenue - a.weekly_revenue;
    });
  }, [sortBy]);

  const machinesNeedingRestock = machines.filter(
    (m) => m.status === 'critical' || m.status === 'low_stock' || m.status === 'offline'
  );

  const nycCenter: [number, number] = [40.73, -73.95];

  return (
    <div className="flex gap-5" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Sidebar */}
      <div
        className="glass-card p-0 flex flex-col overflow-hidden hidden lg:flex"
        style={{ width: 340, flexShrink: 0 }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Restock Priority
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {machinesNeedingRestock.length} machines need attention
            </p>
          </div>
          <button
            onClick={() =>
              setSortBy(sortBy === 'urgency' ? 'revenue' : 'urgency')
            }
            className="flex items-center gap-1 text-xs px-2 py-1 rounded"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <ArrowUpDown size={10} />
            {sortBy === 'urgency' ? 'Urgency' : 'Revenue'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {sortedMachines.map((machine) => {
            const color = markerColors[machine.status];
            const estimatedRevenueAtRisk =
              machine.status === 'critical'
                ? machine.weekly_revenue * 0.5
                : machine.status === 'low_stock'
                ? machine.weekly_revenue * 0.2
                : machine.status === 'offline'
                ? machine.weekly_revenue
                : 0;

            return (
              <div
                key={machine.id}
                className="p-3 rounded-lg transition-colors"
                style={{
                  background:
                    machine.status !== 'online'
                      ? `${color}08`
                      : 'transparent',
                  borderLeft: `3px solid ${color}`,
                  border: `1px solid ${
                    machine.status !== 'online'
                      ? `${color}20`
                      : 'var(--border-subtle)'
                  }`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {machine.name}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: `${color}15`,
                      color,
                    }}
                  >
                    {machine.status.replace('_', ' ')}
                  </span>
                </div>
                <p
                  className="text-xs mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {machine.location_address}
                </p>
                {estimatedRevenueAtRisk > 0 && (
                  <div
                    className="flex items-center justify-between"
                  >
                    <span
                      className="text-xs"
                      style={{ color: 'var(--accent-red)' }}
                    >
                      ${estimatedRevenueAtRisk.toFixed(0)} at risk
                    </span>
                    <button
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                      style={{
                        color: 'var(--accent-blue)',
                        background: 'rgba(59, 130, 246, 0.1)',
                      }}
                    >
                      <Navigation size={10} />
                      Navigate
                    </button>
                  </div>
                )}
                {machine.status === 'online' && (
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {machine.fill_percentage}% full · ${machine.weekly_revenue}/wk
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 glass-card p-0 overflow-hidden">
        <MapContainer
          center={nycCenter}
          zoom={12}
          style={{ height: '100%', width: '100%', background: '#0a0a12' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {machines.map((machine) => {
            const color = markerColors[machine.status];
            return (
              <Marker
                key={machine.id}
                position={[machine.latitude, machine.longitude]}
                icon={createColoredMarker(color)}
              >
                <Popup
                  className="dark-popup"
                >
                  <div style={{ minWidth: 200 }}>
                    <div className="flex items-center justify-between mb-1">
                      <strong
                        className="text-sm"
                        style={{ color: '#F8FAFC' }}
                      >
                        {machine.name}
                      </strong>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: `${color}15`,
                          color,
                        }}
                      >
                        {machine.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p
                      className="text-xs mb-2"
                      style={{ color: '#94A3B8' }}
                    >
                      {machine.location_address}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span style={{ color: '#64748B' }}>Fill: </span>
                        <span style={{ color: '#F8FAFC' }}>
                          {machine.fill_percentage}%
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Revenue: </span>
                        <span style={{ color: '#F8FAFC' }}>
                          ${machine.weekly_revenue}/wk
                        </span>
                      </div>
                    </div>
                    {machine.status !== 'online' && (
                      <button
                        className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium"
                        style={{
                          background: 'rgba(59, 130, 246, 0.9)',
                          color: 'white',
                        }}
                      >
                        <Wrench size={12} />
                        Mark Restocked
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
