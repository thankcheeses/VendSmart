-- VendSmart — Initial Schema
-- Run this in your Supabase SQL editor or via supabase db push

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, business_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'business_name', ''));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── Subscriptions ────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan                    TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  machine_limit           INTEGER NOT NULL DEFAULT 5,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create free subscription on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, machine_limit)
  VALUES (NEW.id, 'free', 'active', 5);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_subscription();

-- ── Machines ─────────────────────────────────────────────────
CREATE TABLE public.machines (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name               TEXT NOT NULL,
  location_address   TEXT NOT NULL DEFAULT '',
  latitude           DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude          DOUBLE PRECISION NOT NULL DEFAULT 0,
  machine_type       TEXT NOT NULL DEFAULT 'snack' CHECK (machine_type IN ('snack', 'drink', 'combo')),
  capacity_slots     INTEGER NOT NULL DEFAULT 40,
  commission_percent DOUBLE PRECISION NOT NULL DEFAULT 10,
  status             TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'low_stock', 'critical')),
  fill_percentage    INTEGER NOT NULL DEFAULT 100 CHECK (fill_percentage >= 0 AND fill_percentage <= 100),
  weekly_revenue     DOUBLE PRECISION NOT NULL DEFAULT 0,
  last_visit_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own machines"
  ON public.machines FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE public.products (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  machine_id      UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
  product_name    TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'snack',
  units_sold_7d   INTEGER NOT NULL DEFAULT 0,
  revenue_7d      DOUBLE PRECISION NOT NULL DEFAULT 0,
  stock_remaining INTEGER NOT NULL DEFAULT 20,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own products"
  ON public.products FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Inventory ────────────────────────────────────────────────
CREATE TABLE public.inventory (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  machine_id        UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
  product_id        UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 0,
  last_restocked_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own inventory"
  ON public.inventory FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Sales Logs ────────────────────────────────────────────────
CREATE TABLE public.sales_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  machine_id  UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  revenue     DOUBLE PRECISION NOT NULL DEFAULT 0,
  sold_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sales_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own sales_logs"
  ON public.sales_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Alerts ────────────────────────────────────────────────────
CREATE TABLE public.alerts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  machine_id   UUID REFERENCES public.machines(id) ON DELETE CASCADE NOT NULL,
  machine_name TEXT NOT NULL DEFAULT '',
  alert_type   TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'machine_offline', 'maintenance_due', 'revenue_drop')),
  severity     TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  message      TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own alerts"
  ON public.alerts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for alerts and machines
ALTER publication supabase_realtime ADD TABLE public.alerts;
ALTER publication supabase_realtime ADD TABLE public.machines;

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX machines_user_id_idx ON public.machines(user_id);
CREATE INDEX alerts_user_id_idx ON public.alerts(user_id);
CREATE INDEX alerts_machine_id_idx ON public.alerts(machine_id);
CREATE INDEX alerts_created_at_idx ON public.alerts(created_at DESC);
CREATE INDEX sales_logs_user_id_idx ON public.sales_logs(user_id);
CREATE INDEX sales_logs_sold_at_idx ON public.sales_logs(sold_at DESC);
CREATE INDEX products_machine_id_idx ON public.products(machine_id);
