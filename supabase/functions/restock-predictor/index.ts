// VendSmart — Restock Predictor Edge Function
// Deploy with: supabase functions deploy restock-predictor
// Schedule with: supabase functions schedule restock-predictor "0 7 * * *"  (daily at 7 AM UTC)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Get all machines with their products
    const { data: machines, error: machineErr } = await supabase
      .from('machines')
      .select('id, user_id, name, status, fill_percentage');

    if (machineErr) throw machineErr;

    const alertsToInsert: Array<{
      user_id: string;
      machine_id: string;
      machine_name: string;
      alert_type: string;
      severity: string;
      message: string;
      acknowledged: boolean;
    }> = [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const machine of machines ?? []) {
      // Skip offline machines (already alerted separately)
      if (machine.status === 'offline') continue;

      // Get 7-day sales velocity for this machine
      const { data: sales } = await supabase
        .from('sales_logs')
        .select('quantity, revenue')
        .eq('machine_id', machine.id)
        .gte('sold_at', sevenDaysAgo.toISOString());

      const totalUnitsSold = (sales ?? []).reduce((s, r) => s + (r.quantity ?? 0), 0);
      const dailyVelocity = totalUnitsSold / 7;

      // Get current inventory
      const { data: products } = await supabase
        .from('products')
        .select('stock_remaining')
        .eq('machine_id', machine.id);

      const totalStock = (products ?? []).reduce((s, p) => s + (p.stock_remaining ?? 0), 0);

      // Calculate days until stock out
      const daysUntilStockout = dailyVelocity > 0 ? totalStock / dailyVelocity : Infinity;

      // Check if an unacknowledged alert of this type already exists (avoid duplicates)
      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('machine_id', machine.id)
        .eq('alert_type', 'low_stock')
        .eq('acknowledged', false)
        .single();

      if (existingAlert) continue; // Already alerted

      if (daysUntilStockout < 2) {
        alertsToInsert.push({
          user_id: machine.user_id,
          machine_id: machine.id,
          machine_name: machine.name,
          alert_type: 'low_stock',
          severity: 'critical',
          message: `Critical: estimated stock-out in ${daysUntilStockout.toFixed(1)} days at current sales velocity (${dailyVelocity.toFixed(1)} units/day). Immediate restock required.`,
          acknowledged: false,
        });
      } else if (daysUntilStockout < 5) {
        alertsToInsert.push({
          user_id: machine.user_id,
          machine_id: machine.id,
          machine_name: machine.name,
          alert_type: 'low_stock',
          severity: 'warning',
          message: `Warning: estimated ${daysUntilStockout.toFixed(1)} days of stock remaining at current sales velocity (${dailyVelocity.toFixed(1)} units/day). Plan a restock visit soon.`,
          acknowledged: false,
        });
      }
    }

    if (alertsToInsert.length > 0) {
      const { error: insertErr } = await supabase.from('alerts').insert(alertsToInsert);
      if (insertErr) throw insertErr;
    }

    return new Response(
      JSON.stringify({ success: true, alertsCreated: alertsToInsert.length, machinesChecked: (machines ?? []).length }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
