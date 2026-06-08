-- VendSmart Seed Data
-- Run AFTER creating a user account to populate demo data.
-- Replace 'YOUR_USER_ID' with the actual Supabase auth.users UUID.

-- Example: copy your user ID from Supabase Auth dashboard, then run:
-- psql -d <connection_string> -v user_id='<your-uuid>' -f seed.sql

DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID';  -- replace this
  m1 UUID; m2 UUID; m3 UUID; m4 UUID; m5 UUID;
BEGIN

-- Machines
INSERT INTO public.machines (id, user_id, name, location_address, latitude, longitude, machine_type, capacity_slots, commission_percent, status, fill_percentage, weekly_revenue, last_visit_date)
VALUES
  (gen_random_uuid(), v_user_id, 'Midtown Office Hub #1', '350 Fifth Ave, New York, NY 10118', 40.7484, -73.9967, 'combo', 48, 12, 'online', 78, 412, CURRENT_DATE - 3)
  RETURNING id INTO m1;

INSERT INTO public.machines (id, user_id, name, location_address, latitude, longitude, machine_type, capacity_slots, commission_percent, status, fill_percentage, weekly_revenue, last_visit_date)
VALUES
  (gen_random_uuid(), v_user_id, 'Penn Station Concourse', '1 Penn Plaza, New York, NY 10119', 40.7506, -73.9935, 'drink', 32, 15, 'critical', 12, 289, CURRENT_DATE - 11)
  RETURNING id INTO m2;

INSERT INTO public.machines (id, user_id, name, location_address, latitude, longitude, machine_type, capacity_slots, commission_percent, status, fill_percentage, weekly_revenue, last_visit_date)
VALUES
  (gen_random_uuid(), v_user_id, 'Times Square Lobby', '1515 Broadway, New York, NY 10036', 40.7579, -73.9855, 'drink', 40, 18, 'online', 91, 687, CURRENT_DATE - 1)
  RETURNING id INTO m3;

INSERT INTO public.machines (id, user_id, name, location_address, latitude, longitude, machine_type, capacity_slots, commission_percent, status, fill_percentage, weekly_revenue, last_visit_date)
VALUES
  (gen_random_uuid(), v_user_id, 'JFK Terminal 4', 'Terminal 4, JFK International Airport, NY', 40.6441, -73.7817, 'combo', 64, 20, 'online', 77, 892, CURRENT_DATE - 1)
  RETURNING id INTO m4;

INSERT INTO public.machines (id, user_id, name, location_address, latitude, longitude, machine_type, capacity_slots, commission_percent, status, fill_percentage, weekly_revenue, last_visit_date)
VALUES
  (gen_random_uuid(), v_user_id, 'Financial District Tower', '28 Liberty St, New York, NY 10005', 40.7075, -74.0113, 'combo', 48, 10, 'low_stock', 31, 298, CURRENT_DATE - 7)
  RETURNING id INTO m5;

-- Products for machine 1
INSERT INTO public.products (user_id, machine_id, product_name, category, units_sold_7d, revenue_7d, stock_remaining)
VALUES
  (v_user_id, m1, 'Coca-Cola Classic', 'Beverage', 142, 212.58, 28),
  (v_user_id, m1, 'Lays Classic Chips', 'Snack', 98, 145.02, 22),
  (v_user_id, m1, 'Kind Dark Chocolate Bar', 'Snack', 87, 173.13, 15);

-- Alerts
INSERT INTO public.alerts (user_id, machine_id, machine_name, alert_type, severity, message, acknowledged)
VALUES
  (v_user_id, m2, 'Penn Station Concourse', 'low_stock', 'critical', 'Fill level at 12% — estimated sell-out in under 24 hours. Immediate restock required.', false),
  (v_user_id, m5, 'Financial District Tower', 'low_stock', 'warning', 'Stock at 31%. At current sales velocity, estimated 3 days until restock needed.', false),
  (v_user_id, m4, 'JFK Terminal 4', 'maintenance_due', 'info', 'Scheduled 90-day maintenance check due in 5 days.', false);

END $$;
