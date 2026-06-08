-- VendSmart — Admin Panel & Security Hardening
-- Migration 003: super-admin flag, audit logs, demo account guard, plan expansion
-- Run: supabase db push

-- ── 1. Super-admin flag ──────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 2. Audit log ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  resource    TEXT,                -- e.g. 'machine', 'subscription', 'supplier_credentials'
  resource_id TEXT,
  metadata    JSONB DEFAULT '{}',
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx  ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx   ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx  ON audit_logs(created_at DESC);

-- Audit logs are append-only: no UPDATE or DELETE
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Super-admins can read all logs
CREATE POLICY "super_admin_read_audit_logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND is_super_admin = TRUE)
  );
-- Any authenticated user can insert their own audit log
CREATE POLICY "insert_own_audit_log"
  ON audit_logs FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- ── 3. Admin impersonation sessions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_impersonation_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason          TEXT,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 hour',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ
);

ALTER TABLE admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super_admin_only_impersonation"
  ON admin_impersonation_sessions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND is_super_admin = TRUE)
  );

-- ── 4. Demo account guard trigger ────────────────────────────────────────────
-- Prevents the demo seed account from placing real restock orders.
-- Set DEMO_ACCOUNT_ID to the actual seeded demo user UUID after seeding.
CREATE OR REPLACE FUNCTION prevent_demo_account_orders()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_demo_id TEXT := current_setting('app.demo_account_id', TRUE);
BEGIN
  IF v_demo_id IS NOT NULL AND v_demo_id != '' AND NEW.user_id::TEXT = v_demo_id THEN
    IF NEW.status != 'draft' THEN
      RAISE EXCEPTION 'Demo account cannot submit real orders.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_demo_orders ON restock_orders;
CREATE TRIGGER trg_prevent_demo_orders
  BEFORE INSERT OR UPDATE ON restock_orders
  FOR EACH ROW EXECUTE FUNCTION prevent_demo_account_orders();

-- ── 5. Audit trigger for sensitive actions ───────────────────────────────────
CREATE OR REPLACE FUNCTION audit_sensitive_action()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource, resource_id, metadata)
  VALUES (
    (SELECT auth.uid()),
    TG_OP || '_' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$;

-- Audit machine deletions
DROP TRIGGER IF EXISTS trg_audit_machines ON machines;
CREATE TRIGGER trg_audit_machines
  AFTER DELETE ON machines
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_action();

-- Audit subscription changes
DROP TRIGGER IF EXISTS trg_audit_subscriptions ON subscriptions;
CREATE TRIGGER trg_audit_subscriptions
  AFTER UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_action();

-- Audit supplier credential changes
DROP TRIGGER IF EXISTS trg_audit_supplier_integrations ON supplier_integrations;
CREATE TRIGGER trg_audit_supplier_integrations
  AFTER INSERT OR UPDATE OR DELETE ON supplier_integrations
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_action();

-- ── 6. Update subscription plan names ────────────────────────────────────────
-- Allow new plan names: operator, business (in addition to free, pro, enterprise)
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'operator', 'pro', 'business', 'enterprise'));

-- Machine limits for new plans
-- free: 5, operator: 25, pro: 100, business: -1 (unlimited), enterprise: -1
-- Enforced in application layer + webhook handler

-- ── 7. Super-admin RLS bypass for machines/profiles ──────────────────────────
-- Super-admins need to read all tenants' data for the admin panel.
-- Add super-admin read policies to key tables.
CREATE POLICY "super_admin_read_all_machines"
  ON machines FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND is_super_admin = TRUE)
  );

CREATE POLICY "super_admin_read_all_profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT auth.uid()) = id
    OR EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = (SELECT auth.uid()) AND p2.is_super_admin = TRUE)
  );

CREATE POLICY "super_admin_read_all_subscriptions"
  ON subscriptions FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND is_super_admin = TRUE)
  );
