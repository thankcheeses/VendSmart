import type { Machine, MachineAlert, Product, DailyRevenue, DashboardMetrics, RestockOrder, SupplierIntegration } from '@/types';

export const machines: Machine[] = [
  // ── Mississippi (US South) ──────────────────────────────────
  {
    id: 'm1',
    user_id: 'demo-user',
    name: 'Biloxi Casino — Gaming Floor',
    location_address: '777 Beach Blvd, Biloxi, MS 39530',
    latitude: 30.3960,
    longitude: -88.8853,
    machine_type: 'combo',
    capacity_slots: 48,
    commission_percent: 14,
    status: 'online',
    fill_percentage: 72,
    weekly_revenue: 521,
    last_visit_date: '2026-06-05',
    created_at: '2026-01-15',
  },
  {
    id: 'm2',
    user_id: 'demo-user',
    name: 'Jackson Medical Center — Cafeteria',
    location_address: '2500 N State St, Jackson, MS 39216',
    latitude: 32.3496,
    longitude: -90.1766,
    machine_type: 'drink',
    capacity_slots: 32,
    commission_percent: 12,
    status: 'critical',
    fill_percentage: 11,
    weekly_revenue: 310,
    last_visit_date: '2026-05-28',
    created_at: '2026-01-20',
  },
  {
    id: 'm3',
    user_id: 'demo-user',
    name: 'Hattiesburg University — Student Union',
    location_address: '118 College Dr, Hattiesburg, MS 39406',
    latitude: 31.3296,
    longitude: -89.3298,
    machine_type: 'snack',
    capacity_slots: 40,
    commission_percent: 9,
    status: 'low_stock',
    fill_percentage: 34,
    weekly_revenue: 198,
    last_visit_date: '2026-06-02',
    created_at: '2026-02-01',
  },
  // ── Los Angeles, CA ─────────────────────────────────────────
  {
    id: 'm4',
    user_id: 'demo-user',
    name: 'LAX — Terminal 4 Gate',
    location_address: '1 World Way, Los Angeles, CA 90045',
    latitude: 33.9425,
    longitude: -118.4081,
    machine_type: 'combo',
    capacity_slots: 64,
    commission_percent: 20,
    status: 'online',
    fill_percentage: 81,
    weekly_revenue: 964,
    last_visit_date: '2026-06-07',
    created_at: '2026-02-10',
  },
  {
    id: 'm5',
    user_id: 'demo-user',
    name: 'Downtown LA — Wilshire Office Tower',
    location_address: '444 S Flower St, Los Angeles, CA 90071',
    latitude: 34.0501,
    longitude: -118.2576,
    machine_type: 'drink',
    capacity_slots: 36,
    commission_percent: 15,
    status: 'online',
    fill_percentage: 67,
    weekly_revenue: 445,
    last_visit_date: '2026-06-06',
    created_at: '2026-02-15',
  },
  // ── Chicago, IL ─────────────────────────────────────────────
  {
    id: 'm6',
    user_id: 'demo-user',
    name: "O'Hare Airport — Terminal 3",
    location_address: "10000 W O'Hare Ave, Chicago, IL 60666",
    latitude: 41.9742,
    longitude: -87.9073,
    machine_type: 'combo',
    capacity_slots: 56,
    commission_percent: 18,
    status: 'online',
    fill_percentage: 88,
    weekly_revenue: 872,
    last_visit_date: '2026-06-07',
    created_at: '2026-03-01',
  },
  {
    id: 'm7',
    user_id: 'demo-user',
    name: 'Chicago Loop — Willis Tower Lobby',
    location_address: '233 S Wacker Dr, Chicago, IL 60606',
    latitude: 41.8789,
    longitude: -87.6359,
    machine_type: 'snack',
    capacity_slots: 44,
    commission_percent: 13,
    status: 'offline',
    fill_percentage: 0,
    weekly_revenue: 387,
    last_visit_date: '2026-05-25',
    created_at: '2026-03-10',
  },
  // ── Tokyo, Japan ────────────────────────────────────────────
  {
    id: 'm8',
    user_id: 'demo-user',
    name: 'Shibuya Station — West Exit',
    location_address: '2-1 Dogenzaka, Shibuya, Tokyo 150-0043',
    latitude: 35.6580,
    longitude: 139.7016,
    machine_type: 'drink',
    capacity_slots: 32,
    commission_percent: 10,
    status: 'online',
    fill_percentage: 59,
    weekly_revenue: 612,
    last_visit_date: '2026-06-06',
    created_at: '2026-03-15',
  },
  {
    id: 'm9',
    user_id: 'demo-user',
    name: 'Shinjuku Office Park — B1',
    location_address: '3-7-1 Nishi-Shinjuku, Tokyo 160-0023',
    latitude: 35.6895,
    longitude: 139.6917,
    machine_type: 'combo',
    capacity_slots: 48,
    commission_percent: 11,
    status: 'online',
    fill_percentage: 76,
    weekly_revenue: 541,
    last_visit_date: '2026-06-05',
    created_at: '2026-03-20',
  },
  // ── London, UK ──────────────────────────────────────────────
  {
    id: 'm10',
    user_id: 'demo-user',
    name: 'Canary Wharf — One Canada Square',
    location_address: '1 Canada Square, London E14 5AB, UK',
    latitude: 51.5054,
    longitude: -0.0235,
    machine_type: 'combo',
    capacity_slots: 52,
    commission_percent: 16,
    status: 'online',
    fill_percentage: 63,
    weekly_revenue: 589,
    last_visit_date: '2026-06-05',
    created_at: '2026-04-01',
  },
  // ── Toronto, Canada ─────────────────────────────────────────
  {
    id: 'm11',
    user_id: 'demo-user',
    name: 'Pearson Airport — Terminal 1',
    location_address: '6301 Silver Dart Dr, Mississauga, ON L5P 1B2',
    latitude: 43.6777,
    longitude: -79.6248,
    machine_type: 'combo',
    capacity_slots: 60,
    commission_percent: 19,
    status: 'online',
    fill_percentage: 85,
    weekly_revenue: 748,
    last_visit_date: '2026-06-07',
    created_at: '2026-04-10',
  },
  // ── Sydney, Australia ───────────────────────────────────────
  {
    id: 'm12',
    user_id: 'demo-user',
    name: 'Sydney CBD — Westfield Tower',
    location_address: '100 Market St, Sydney NSW 2000, Australia',
    latitude: -33.8708,
    longitude: 151.2073,
    machine_type: 'snack',
    capacity_slots: 36,
    commission_percent: 12,
    status: 'low_stock',
    fill_percentage: 29,
    weekly_revenue: 334,
    last_visit_date: '2026-06-03',
    created_at: '2026-04-20',
  },
];

export const alerts: MachineAlert[] = [
  {
    id: 'a1',
    machine_id: 'm2',
    machine_name: 'Jackson Medical Center — Cafeteria',
    alert_type: 'low_stock',
    severity: 'critical',
    message: 'Fill level at 11% — estimated sell-out in under 24 hours. Immediate restock required.',
    acknowledged: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a2',
    machine_id: 'm3',
    machine_name: 'Hattiesburg University — Student Union',
    alert_type: 'low_stock',
    severity: 'critical',
    message: 'Critical stock at 34%. High foot-traffic location losing an estimated $28/day.',
    acknowledged: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a3',
    machine_id: 'm7',
    machine_name: 'Chicago Loop — Willis Tower Lobby',
    alert_type: 'machine_offline',
    severity: 'critical',
    message: 'Machine is offline — no heartbeat in 13 days. Power or network issue suspected.',
    acknowledged: false,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a4',
    machine_id: 'm12',
    machine_name: 'Sydney CBD — Westfield Tower',
    alert_type: 'low_stock',
    severity: 'warning',
    message: 'Stock at 29%. At current sales velocity, estimated 2 days until empty.',
    acknowledged: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a5',
    machine_id: 'm4',
    machine_name: 'LAX — Terminal 4 Gate',
    alert_type: 'maintenance_due',
    severity: 'info',
    message: 'Scheduled 90-day maintenance check due in 4 days. High-value airport location — plan accordingly.',
    acknowledged: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a6',
    machine_id: 'm10',
    machine_name: 'Canary Wharf — One Canada Square',
    alert_type: 'revenue_drop',
    severity: 'warning',
    message: 'Revenue down 19% vs. last week. May be impacted by bank holiday foot traffic.',
    acknowledged: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a7',
    machine_id: 'm8',
    machine_name: 'Shibuya Station — West Exit',
    alert_type: 'revenue_drop',
    severity: 'warning',
    message: 'Revenue down 15% — possible product rotation needed for seasonal demand shift.',
    acknowledged: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a8',
    machine_id: 'm5',
    machine_name: 'Downtown LA — Wilshire Office Tower',
    alert_type: 'low_stock',
    severity: 'warning',
    message: 'Stock at 67%. Trending down — consider scheduling restock this week.',
    acknowledged: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a9',
    machine_id: 'm9',
    machine_name: 'Shinjuku Office Park — B1',
    alert_type: 'maintenance_due',
    severity: 'info',
    message: 'Bill acceptor flagged a partial jam. Clear jam or schedule technician visit.',
    acknowledged: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a10',
    machine_id: 'm11',
    machine_name: 'Pearson Airport — Terminal 1',
    alert_type: 'revenue_drop',
    severity: 'info',
    message: 'Slight revenue dip on weekday mornings. Consider adjusting product mix.',
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
  { product_id: 'p1', product_name: 'Coca-Cola Classic', category: 'Beverage', machine_id: 'm1', units_sold_7d: 112, revenue_7d: 167.76, stock_remaining: 22 },
  { product_id: 'p2', product_name: "Lay's Classic Chips", category: 'Snack', machine_id: 'm1', units_sold_7d: 88, revenue_7d: 130.24, stock_remaining: 18 },
  { product_id: 'p3', product_name: 'Snickers Bar', category: 'Candy', machine_id: 'm1', units_sold_7d: 76, revenue_7d: 113.24, stock_remaining: 14 },
  { product_id: 'p4', product_name: 'Red Bull Energy 12oz', category: 'Beverage', machine_id: 'm2', units_sold_7d: 68, revenue_7d: 237.56, stock_remaining: 5 },
  { product_id: 'p5', product_name: 'Dasani Water 20oz', category: 'Beverage', machine_id: 'm2', units_sold_7d: 43, revenue_7d: 60.20, stock_remaining: 7 },
  { product_id: 'p6', product_name: 'Pepsi 20oz', category: 'Beverage', machine_id: 'm3', units_sold_7d: 94, revenue_7d: 140.06, stock_remaining: 16 },
  { product_id: 'p7', product_name: 'Doritos Nacho Cheese', category: 'Snack', machine_id: 'm3', units_sold_7d: 72, revenue_7d: 107.28, stock_remaining: 12 },
  { product_id: 'p8', product_name: 'Kind Dark Chocolate Bar', category: 'Bar', machine_id: 'm4', units_sold_7d: 198, revenue_7d: 493.02, stock_remaining: 38 },
  { product_id: 'p9', product_name: 'Pringles Original', category: 'Snack', machine_id: 'm4', units_sold_7d: 154, revenue_7d: 307.54, stock_remaining: 29 },
  { product_id: 'p10', product_name: 'Vitamin Water XXX', category: 'Beverage', machine_id: 'm5', units_sold_7d: 87, revenue_7d: 182.43, stock_remaining: 21 },
  { product_id: 'p11', product_name: 'Clif Bar Chocolate Chip', category: 'Bar', machine_id: 'm5', units_sold_7d: 61, revenue_7d: 140.30, stock_remaining: 15 },
  { product_id: 'p12', product_name: 'Sprite 20oz', category: 'Beverage', machine_id: 'm6', units_sold_7d: 143, revenue_7d: 271.27, stock_remaining: 32 },
];

const machineProductMap: Record<string, typeof productPerformance> = {
  m1: productPerformance.filter(p => p.machine_id === 'm1'),
  m2: productPerformance.filter(p => p.machine_id === 'm2'),
  m3: productPerformance.filter(p => p.machine_id === 'm3'),
  m4: productPerformance.filter(p => p.machine_id === 'm4'),
  m5: productPerformance.filter(p => p.machine_id === 'm5'),
  m6: productPerformance.filter(p => p.machine_id === 'm6'),
  m7: [
    { product_id: 'p13', product_name: 'Sparkling Water 500ml', category: 'Beverage', machine_id: 'm7', units_sold_7d: 201, revenue_7d: 562.80, stock_remaining: 0 },
    { product_id: 'p14', product_name: 'Granola Bar', category: 'Bar', machine_id: 'm7', units_sold_7d: 144, revenue_7d: 374.40, stock_remaining: 0 },
  ],
  m8: [
    { product_id: 'p15', product_name: 'Green Tea 500ml', category: 'Beverage', machine_id: 'm8', units_sold_7d: 218, revenue_7d: 327.00, stock_remaining: 22 },
    { product_id: 'p16', product_name: 'Rice Crackers', category: 'Snack', machine_id: 'm8', units_sold_7d: 176, revenue_7d: 264.00, stock_remaining: 18 },
  ],
};

for (const [id, machine] of Object.entries(machineProductMap)) {
  if (!machine.length) {
    machineProductMap[id] = [
      { product_id: `p-${id}-1`, product_name: 'Coca-Cola 20oz', category: 'Beverage', machine_id: id, units_sold_7d: 72, revenue_7d: 108.00, stock_remaining: 18 },
      { product_id: `p-${id}-2`, product_name: "Lay's Classic", category: 'Snack', machine_id: id, units_sold_7d: 54, revenue_7d: 81.00, stock_remaining: 14 },
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
  business_name: 'Demo Operator',
  email: 'demo@vendsmart.app',
};

export const mockRestockOrders: RestockOrder[] = [
  {
    id: 'ord-1',
    user_id: 'demo-user',
    supplier: 'amazon_business',
    status: 'delivered',
    line_items: [
      { product_id: 'p4', product_name: 'Red Bull Energy 12oz', machine_name: 'Jackson Medical Center — Cafeteria', upc: '611269111693', supplier_sku: 'B00122YBXY', qty_ordered: 48, unit_price: 2.18, total_price: 104.64, supplier: 'amazon_business' },
      { product_id: 'p6', product_name: 'Pepsi 20oz', machine_name: 'Hattiesburg University — Student Union', upc: '012000001215', supplier_sku: 'B07H55WKQK', qty_ordered: 72, unit_price: 0.89, total_price: 64.08, supplier: 'amazon_business' },
      { product_id: 'p3', product_name: 'Snickers Bar', machine_name: 'Biloxi Casino — Gaming Floor', upc: '040000448328', supplier_sku: 'B000EVOSE4', qty_ordered: 60, unit_price: 0.75, total_price: 45.00, supplier: 'amazon_business' },
    ],
    order_total: 213.72,
    supplier_order_id: 'AMZ-113-4829-20260520',
    tracking_number: '1Z999AA10123456784',
    estimated_delivery: '2026-05-24',
    submitted_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-2',
    user_id: 'demo-user',
    supplier: 'amazon_business',
    status: 'shipped',
    line_items: [
      { product_id: 'p10', product_name: 'Vitamin Water XXX', machine_name: 'Downtown LA — Wilshire Office Tower', upc: '012000001215', supplier_sku: 'B07H55WKQK', qty_ordered: 36, unit_price: 1.09, total_price: 39.24, supplier: 'amazon_business' },
      { product_id: 'p11', product_name: 'Clif Bar Chocolate Chip', machine_name: 'Downtown LA — Wilshire Office Tower', upc: '722252114709', supplier_sku: 'B00121LTMO', qty_ordered: 24, unit_price: 1.38, total_price: 33.12, supplier: 'amazon_business' },
      { product_id: 'p1', product_name: 'Coca-Cola Classic', machine_name: 'Biloxi Casino — Gaming Floor', upc: '049000028911', supplier_sku: 'B07PH2QXCM', qty_ordered: 30, unit_price: 0.89, total_price: 26.70, supplier: 'amazon_business' },
    ],
    order_total: 99.06,
    supplier_order_id: 'AMZ-113-5201-20260601',
    tracking_number: '1Z999AA10187654321',
    estimated_delivery: '2026-06-10',
    submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-3',
    user_id: 'demo-user',
    supplier: 'mixed',
    status: 'draft',
    line_items: [],
    order_total: 0,
    created_at: new Date().toISOString(),
  },
];

export const mockSupplierIntegrations: SupplierIntegration[] = [
  { id: 'si-1', user_id: 'demo-user', supplier_name: 'amazon_business', status: 'disconnected', created_at: new Date().toISOString() },
  { id: 'si-2', user_id: 'demo-user', supplier_name: 'sysco', status: 'disconnected', created_at: new Date().toISOString() },
  { id: 'si-3', user_id: 'demo-user', supplier_name: 'sams_club', status: 'disconnected', created_at: new Date().toISOString() },
  { id: 'si-4', user_id: 'demo-user', supplier_name: 'manual', status: 'connected', created_at: new Date().toISOString() },
];
