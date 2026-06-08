import type { Machine, MachineAlert, Product, DailyRevenue, DashboardMetrics } from '@/types';

export const machines: Machine[] = [
  {
    id: 'm1',
    user_id: 'demo-user',
    name: 'Midtown Office Hub #1',
    location_address: '350 Fifth Ave, New York, NY 10118',
    latitude: 40.7484,
    longitude: -73.9967,
    machine_type: 'combo',
    capacity_slots: 48,
    commission_percent: 12,
    status: 'online',
    fill_percentage: 78,
    weekly_revenue: 412,
    last_visit_date: '2026-06-05',
    created_at: '2026-01-15',
  },
  {
    id: 'm2',
    user_id: 'demo-user',
    name: 'Penn Station Concourse',
    location_address: '1 Penn Plaza, New York, NY 10119',
    latitude: 40.7506,
    longitude: -73.9935,
    machine_type: 'drink',
    capacity_slots: 32,
    commission_percent: 15,
    status: 'critical',
    fill_percentage: 12,
    weekly_revenue: 289,
    last_visit_date: '2026-05-28',
    created_at: '2026-01-20',
  },
  {
    id: 'm3',
    user_id: 'demo-user',
    name: 'Times Square Lobby',
    location_address: '1515 Broadway, New York, NY 10036',
    latitude: 40.7579,
    longitude: -73.9855,
    machine_type: 'drink',
    capacity_slots: 40,
    commission_percent: 18,
    status: 'online',
    fill_percentage: 91,
    weekly_revenue: 687,
    last_visit_date: '2026-06-07',
    created_at: '2026-02-01',
  },
  {
    id: 'm4',
    user_id: 'demo-user',
    name: 'Grand Central Snack Bar',
    location_address: '89 E 42nd St, New York, NY 10017',
    latitude: 40.7527,
    longitude: -73.9772,
    machine_type: 'snack',
    capacity_slots: 56,
    commission_percent: 14,
    status: 'online',
    fill_percentage: 62,
    weekly_revenue: 356,
    last_visit_date: '2026-06-04',
    created_at: '2026-02-10',
  },
  {
    id: 'm5',
    user_id: 'demo-user',
    name: 'Financial District Tower',
    location_address: '28 Liberty St, New York, NY 10005',
    latitude: 40.7075,
    longitude: -74.0113,
    machine_type: 'combo',
    capacity_slots: 48,
    commission_percent: 10,
    status: 'low_stock',
    fill_percentage: 31,
    weekly_revenue: 298,
    last_visit_date: '2026-06-01',
    created_at: '2026-02-15',
  },
  {
    id: 'm6',
    user_id: 'demo-user',
    name: 'Brooklyn Bridge Plaza',
    location_address: '1 Centre St, Brooklyn, NY 11201',
    latitude: 40.7027,
    longitude: -73.9873,
    machine_type: 'snack',
    capacity_slots: 36,
    commission_percent: 11,
    status: 'online',
    fill_percentage: 84,
    weekly_revenue: 245,
    last_visit_date: '2026-06-06',
    created_at: '2026-03-01',
  },
  {
    id: 'm7',
    user_id: 'demo-user',
    name: 'JFK Terminal 4',
    location_address: 'Terminal 4, JFK International Airport, NY',
    latitude: 40.6441,
    longitude: -73.7817,
    machine_type: 'combo',
    capacity_slots: 64,
    commission_percent: 20,
    status: 'online',
    fill_percentage: 77,
    weekly_revenue: 892,
    last_visit_date: '2026-06-07',
    created_at: '2026-03-10',
  },
  {
    id: 'm8',
    user_id: 'demo-user',
    name: 'LaGuardia Gate C',
    location_address: 'Gate C, LaGuardia Airport, NY 11371',
    latitude: 40.7769,
    longitude: -73.8740,
    machine_type: 'drink',
    capacity_slots: 28,
    commission_percent: 20,
    status: 'critical',
    fill_percentage: 8,
    weekly_revenue: 634,
    last_visit_date: '2026-05-30',
    created_at: '2026-03-15',
  },
  {
    id: 'm9',
    user_id: 'demo-user',
    name: 'Columbia University Wien',
    location_address: '619 W 116th St, New York, NY 10027',
    latitude: 40.8075,
    longitude: -73.9626,
    machine_type: 'snack',
    capacity_slots: 44,
    commission_percent: 9,
    status: 'low_stock',
    fill_percentage: 38,
    weekly_revenue: 218,
    last_visit_date: '2026-06-02',
    created_at: '2026-03-20',
  },
  {
    id: 'm10',
    user_id: 'demo-user',
    name: 'Rockefeller Center B1',
    location_address: '1 Rockefeller Plaza, New York, NY 10020',
    latitude: 40.7587,
    longitude: -73.9787,
    machine_type: 'combo',
    capacity_slots: 52,
    commission_percent: 16,
    status: 'online',
    fill_percentage: 55,
    weekly_revenue: 478,
    last_visit_date: '2026-06-05',
    created_at: '2026-04-01',
  },
  {
    id: 'm11',
    user_id: 'demo-user',
    name: 'Wall Street Metro Station',
    location_address: 'Wall St Station, New York, NY 10005',
    latitude: 40.7074,
    longitude: -74.0113,
    machine_type: 'drink',
    capacity_slots: 24,
    commission_percent: 13,
    status: 'offline',
    fill_percentage: 0,
    weekly_revenue: 312,
    last_visit_date: '2026-05-25',
    created_at: '2026-04-10',
  },
  {
    id: 'm12',
    user_id: 'demo-user',
    name: 'Upper East Side Fitness',
    location_address: '1187 Lexington Ave, New York, NY 10028',
    latitude: 40.7773,
    longitude: -73.9556,
    machine_type: 'snack',
    capacity_slots: 32,
    commission_percent: 10,
    status: 'online',
    fill_percentage: 93,
    weekly_revenue: 187,
    last_visit_date: '2026-06-08',
    created_at: '2026-04-20',
  },
];

export const alerts: MachineAlert[] = [
  {
    id: 'a1',
    machine_id: 'm2',
    machine_name: 'Penn Station Concourse',
    alert_type: 'low_stock',
    severity: 'critical',
    message: 'Fill level at 12% — estimated sell-out in under 24 hours. Immediate restock required.',
    acknowledged: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a2',
    machine_id: 'm8',
    machine_name: 'LaGuardia Gate C',
    alert_type: 'low_stock',
    severity: 'critical',
    message: 'Critical stock level at 8%. High-traffic airport location losing an estimated $90/day.',
    acknowledged: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a3',
    machine_id: 'm11',
    machine_name: 'Wall Street Metro Station',
    alert_type: 'machine_offline',
    severity: 'critical',
    message: 'Machine is offline — no heartbeat in 13 days. Power or network issue suspected.',
    acknowledged: false,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a4',
    machine_id: 'm5',
    machine_name: 'Financial District Tower',
    alert_type: 'low_stock',
    severity: 'warning',
    message: 'Stock at 31%. At current sales velocity, estimated 3 days until restock needed.',
    acknowledged: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a5',
    machine_id: 'm9',
    machine_name: 'Columbia University Wien',
    alert_type: 'low_stock',
    severity: 'warning',
    message: 'Stock at 38%. Recommend restock on next route through Upper Manhattan.',
    acknowledged: false,
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a6',
    machine_id: 'm7',
    machine_name: 'JFK Terminal 4',
    alert_type: 'maintenance_due',
    severity: 'info',
    message: 'Scheduled 90-day maintenance check due in 5 days. High-value location — plan accordingly.',
    acknowledged: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a7',
    machine_id: 'm10',
    machine_name: 'Rockefeller Center B1',
    alert_type: 'revenue_drop',
    severity: 'warning',
    message: 'Revenue down 23% vs. last week. 55% fill rate may be suppressing sales.',
    acknowledged: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a8',
    machine_id: 'm4',
    machine_name: 'Grand Central Snack Bar',
    alert_type: 'low_stock',
    severity: 'warning',
    message: 'Stock at 62%. Trending down — consider scheduling a restock visit this week.',
    acknowledged: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a9',
    machine_id: 'm3',
    machine_name: 'Times Square Lobby',
    alert_type: 'maintenance_due',
    severity: 'info',
    message: 'Bill acceptor flagged a jam. Clear jam or schedule technician visit.',
    acknowledged: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a10',
    machine_id: 'm6',
    machine_name: 'Brooklyn Bridge Plaza',
    alert_type: 'revenue_drop',
    severity: 'info',
    message: 'Revenue dip noted on weekends. Consider adjusting product mix for tourist foot traffic.',
    acknowledged: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function generateDailyRevenue(): DailyRevenue[] {
  const days: DailyRevenue[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = 1200 + Math.sin(i * 0.4) * 200 + Math.random() * 300;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const total = Math.round((isWeekend ? base * 0.7 : base) + Math.random() * 150);
    const drink = Math.round(total * (0.38 + Math.random() * 0.06));
    const snack = Math.round(total * (0.32 + Math.random() * 0.06));
    days.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total,
      drink,
      snack,
    });
  }
  return days;
}

export const dailyRevenue: DailyRevenue[] = generateDailyRevenue();

export const productPerformance: Product[] = [
  { product_id: 'p1', product_name: 'Coca-Cola Classic', category: 'Beverage', machine_id: 'm1', units_sold_7d: 142, revenue_7d: 212.58, stock_remaining: 28 },
  { product_id: 'p2', product_name: 'Lays Classic Chips', category: 'Snack', machine_id: 'm1', units_sold_7d: 98, revenue_7d: 145.02, stock_remaining: 22 },
  { product_id: 'p3', product_name: 'Kind Dark Chocolate Bar', category: 'Snack', machine_id: 'm1', units_sold_7d: 87, revenue_7d: 173.13, stock_remaining: 15 },
  { product_id: 'p4', product_name: 'Red Bull Energy', category: 'Beverage', machine_id: 'm2', units_sold_7d: 76, revenue_7d: 265.24, stock_remaining: 8 },
  { product_id: 'p5', product_name: 'Snickers Bar', category: 'Candy', machine_id: 'm2', units_sold_7d: 112, revenue_7d: 145.60, stock_remaining: 12 },
  { product_id: 'p6', product_name: 'Dasani Water 20oz', category: 'Beverage', machine_id: 'm3', units_sold_7d: 198, revenue_7d: 277.20, stock_remaining: 45 },
  { product_id: 'p7', product_name: 'Doritos Nacho Cheese', category: 'Snack', machine_id: 'm3', units_sold_7d: 134, revenue_7d: 195.26, stock_remaining: 30 },
  { product_id: 'p8', product_name: 'Vitamin Water XXX', category: 'Beverage', machine_id: 'm4', units_sold_7d: 43, revenue_7d: 90.30, stock_remaining: 18 },
  { product_id: 'p9', product_name: 'Cliff Bar Chocolate Chip', category: 'Bar', machine_id: 'm4', units_sold_7d: 38, revenue_7d: 87.40, stock_remaining: 14 },
  { product_id: 'p10', product_name: 'Pepsi 20oz', category: 'Beverage', machine_id: 'm5', units_sold_7d: 67, revenue_7d: 100.50, stock_remaining: 9 },
  { product_id: 'p11', product_name: 'Cheetos Flamin Hot', category: 'Snack', machine_id: 'm5', units_sold_7d: 29, revenue_7d: 43.21, stock_remaining: 11 },
  { product_id: 'p12', product_name: 'Sprite 20oz', category: 'Beverage', machine_id: 'm6', units_sold_7d: 89, revenue_7d: 124.60, stock_remaining: 24 },
];

const machineProductMap: Record<string, typeof productPerformance> = {
  m1: productPerformance.filter(p => p.machine_id === 'm1'),
  m2: productPerformance.filter(p => p.machine_id === 'm2'),
  m3: productPerformance.filter(p => p.machine_id === 'm3'),
  m4: productPerformance.filter(p => p.machine_id === 'm4'),
  m5: productPerformance.filter(p => p.machine_id === 'm5'),
  m6: productPerformance.filter(p => p.machine_id === 'm6'),
  m7: [
    { product_id: 'p13', product_name: 'Red Bull 12oz', category: 'Beverage', machine_id: 'm7', units_sold_7d: 186, revenue_7d: 557.14, stock_remaining: 32 },
    { product_id: 'p14', product_name: 'Pringles Original', category: 'Snack', machine_id: 'm7', units_sold_7d: 143, revenue_7d: 200.20, stock_remaining: 28 },
  ],
  m8: [
    { product_id: 'p15', product_name: 'Evian Water 16oz', category: 'Beverage', machine_id: 'm8', units_sold_7d: 212, revenue_7d: 338.64, stock_remaining: 4 },
    { product_id: 'p16', product_name: 'Kind Bar Caramel', category: 'Bar', machine_id: 'm8', units_sold_7d: 98, revenue_7d: 196.00, stock_remaining: 2 },
  ],
};

for (const [id, machine] of Object.entries(machineProductMap)) {
  if (!machine.length) {
    machineProductMap[id] = [
      { product_id: `p-${id}-1`, product_name: 'Coca-Cola 20oz', category: 'Beverage', machine_id: id, units_sold_7d: 72, revenue_7d: 108.00, stock_remaining: 18 },
      { product_id: `p-${id}-2`, product_name: 'Lay\'s Classic', category: 'Snack', machine_id: id, units_sold_7d: 54, revenue_7d: 81.00, stock_remaining: 14 },
    ];
  }
}

export function getMachineProducts(machineId: string) {
  return machineProductMap[machineId] ?? [
    { product_id: `${machineId}-default`, product_name: 'Assorted Items', category: 'Mixed', machine_id: machineId, units_sold_7d: 60, revenue_7d: 120, stock_remaining: 20 },
  ];
}

export function getMachineSparkline(machineId: string): number[] {
  const seed = machineId.charCodeAt(machineId.length - 1);
  const base = (seed % 3 === 0 ? 80 : seed % 3 === 1 ? 120 : 60);
  return Array.from({ length: 7 }, (_, i) =>
    Math.max(10, Math.round(base + Math.sin(i + seed) * 20 + (Math.random() * 30 - 15)))
  );
}

export const dashboardMetrics: DashboardMetrics = {
  activeMachines: machines.filter(m => m.status === 'online').length,
  totalMachines: machines.length,
  weeklyRevenue: machines.reduce((sum, m) => sum + m.weekly_revenue, 0),
  revenueChange: 7.2,
  lowStockAlerts: alerts.filter(a => !a.acknowledged && a.alert_type === 'low_stock').length,
  criticalAlerts: alerts.filter(a => !a.acknowledged && a.severity === 'critical').length,
  avgFillRate: Math.round(
    machines.filter(m => m.status !== 'offline').reduce((sum, m) => sum + m.fill_percentage, 0) /
    machines.filter(m => m.status !== 'offline').length
  ),
  fillRateChange: -2.1,
};

export const currentUser = {
  id: 'demo-user',
  business_name: 'VendSmart Demo',
  email: 'demo@vendsmart.app',
};
