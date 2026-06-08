-- Migration 004: Global schema — multi-currency, timezone, demo flag, feature flags
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS patterns)

-- ── profiles: global & feature-flag columns ────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS home_currency CHAR(3)     NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS timezone      VARCHAR(50)  NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS is_demo       BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS feature_flags JSONB        NOT NULL DEFAULT '{}';

-- ── machines: per-machine locale columns ───────────────────────────────────
ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS country  CHAR(2),          -- ISO 3166 alpha-2 (US, JP, GB, …)
  ADD COLUMN IF NOT EXISTS currency CHAR(3)  NOT NULL DEFAULT 'USD',  -- ISO 4217
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);       -- IANA tz (America/Chicago, Asia/Tokyo …)

-- ── subscriptions: ensure new plan values are allowed ──────────────────────
-- Drop old constraint if it exists, re-add with full set of plan values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'subscriptions_plan_check'
      AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_plan_check;
  END IF;
END $$;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'operator', 'pro', 'business', 'enterprise'));

-- ── RLS policies for new columns (profiles already has user-scoped RLS) ────
-- No new tables, existing RLS on profiles/machines covers the new columns.

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_machines_country  ON machines(country);
CREATE INDEX IF NOT EXISTS idx_machines_currency ON machines(currency);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo  ON profiles(is_demo);
