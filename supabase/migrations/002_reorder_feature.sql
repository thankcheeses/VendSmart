-- VendSmart — Reorder Feature Schema
-- Phase 2: supplier integrations, restock orders, product catalog fields
-- Run after 001_initial_schema.sql

-- ── Extend products table with catalog fields ─────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS upc TEXT,
  ADD COLUMN IF NOT EXISTS supplier_sku JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reorder_threshold INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS preferred_supplier TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS unit_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unit_price DOUBLE PRECISION NOT NULL DEFAULT 0;

-- ── Extend machines table with site type ──────────────────────
ALTER TABLE public.machines
  ADD COLUMN IF NOT EXISTS site_type TEXT NOT NULL DEFAULT 'office'
    CHECK (site_type IN ('office', 'manufacturing', 'hospital', 'school', 'hotel', 'gym', 'transit', 'retail', 'other'));

-- ── Machine Slots ─────────────────────────────────────────────
-- Normalized slot-level inventory tracking per machine
CREATE TABLE IF NOT EXISTS public.machine_slots (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  machine_id   UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
  slot_number  INTEGER NOT NULL,
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  capacity     INTEGER NOT NULL DEFAULT 10,
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (machine_id, slot_number)
);

ALTER TABLE public.machine_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own machine_slots"
  ON public.machine_slots FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX machine_slots_machine_id_idx ON public.machine_slots(machine_id);
CREATE INDEX machine_slots_user_id_idx ON public.machine_slots(user_id);

-- ── Inventory Transactions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  machine_id       UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
  product_id       UUID REFERENCES public.products(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('fill', 'sale', 'waste', 'adjustment')),
  quantity_delta   INTEGER NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own inventory_transactions"
  ON public.inventory_transactions FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX inv_tx_user_id_idx ON public.inventory_transactions(user_id);
CREATE INDEX inv_tx_machine_id_idx ON public.inventory_transactions(machine_id);
CREATE INDEX inv_tx_created_at_idx ON public.inventory_transactions(created_at DESC);

-- ── Routes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.routes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own routes"
  ON public.routes FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ── Route Stops ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.route_stops (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  route_id                 UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  machine_id               UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
  stop_order               INTEGER NOT NULL,
  estimated_duration_mins  INTEGER NOT NULL DEFAULT 15,
  notes                    TEXT
);

ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own route_stops"
  ON public.route_stops FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX route_stops_route_id_idx ON public.route_stops(route_id);

-- ── Supplier Integrations ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_integrations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  supplier_name   TEXT NOT NULL CHECK (supplier_name IN ('amazon_business', 'sysco', 'sams_club', 'walmart_business', 'manual')),
  status          TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  -- Credentials stored as JSONB; encrypt sensitive fields at app layer or use Supabase Vault
  credentials     JSONB NOT NULL DEFAULT '{}',
  last_sync_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, supplier_name)
);

ALTER TABLE public.supplier_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own supplier_integrations"
  ON public.supplier_integrations FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX supplier_integrations_user_id_idx ON public.supplier_integrations(user_id);

-- ── Product Supplier Map ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_supplier_map (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id            UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  supplier              TEXT NOT NULL CHECK (supplier IN ('amazon_business', 'sysco', 'sams_club', 'walmart_business', 'manual')),
  supplier_sku          TEXT,
  supplier_url          TEXT,
  last_price            DOUBLE PRECISION,
  last_price_checked_at TIMESTAMPTZ,
  in_stock              BOOLEAN NOT NULL DEFAULT TRUE,
  lead_time_days        INTEGER NOT NULL DEFAULT 2,
  UNIQUE (product_id, supplier)
);

ALTER TABLE public.product_supplier_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own product_supplier_map"
  ON public.product_supplier_map FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX product_supplier_map_product_id_idx ON public.product_supplier_map(product_id);
CREATE INDEX product_supplier_map_user_id_idx ON public.product_supplier_map(user_id);

-- ── Restock Orders ────────────────────────────────────────────
-- line_items JSONB schema per item:
-- { product_id, product_name, machine_name, upc, supplier_sku, qty_ordered,
--   unit_price, total_price, supplier }
CREATE TABLE IF NOT EXISTS public.restock_orders (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  supplier           TEXT NOT NULL CHECK (supplier IN ('amazon_business', 'sysco', 'sams_club', 'walmart_business', 'manual', 'mixed')),
  status             TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  line_items         JSONB NOT NULL DEFAULT '[]',
  order_total        DOUBLE PRECISION NOT NULL DEFAULT 0,
  supplier_order_id  TEXT,
  tracking_number    TEXT,
  estimated_delivery DATE,
  notes              TEXT,
  submitted_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.restock_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own restock_orders"
  ON public.restock_orders FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX restock_orders_user_id_idx ON public.restock_orders(user_id);
CREATE INDEX restock_orders_status_idx ON public.restock_orders(status);
CREATE INDEX restock_orders_created_at_idx ON public.restock_orders(created_at DESC);

-- Enable realtime for restock_orders
ALTER publication supabase_realtime ADD TABLE public.restock_orders;
