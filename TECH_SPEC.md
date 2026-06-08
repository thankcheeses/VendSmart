# VendSmart — Technical Specification

## Overview

VendSmart is a production SaaS for vending machine fleet management. Operators track machines in real-time, receive anomaly alerts, plan restocks, and analyze revenue — from a web app or native iOS/Android app.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| Routing | React Router 7 (BrowserRouter) |
| Styling | Tailwind CSS 3 + custom CSS design tokens |
| UI Primitives | Radix UI (via shadcn/ui) |
| Charts | Recharts |
| Maps | React-Leaflet + OpenStreetMap (Carto dark tiles) |
| Backend | Supabase (Postgres + Auth + Realtime + Edge Functions) |
| Billing | Stripe (Checkout Sessions + webhooks) |
| Mobile | Capacitor 8 (iOS + Android, wrapping the web app) |
| Deployment | Vercel (free tier, `vend-smart.vercel.app`) |
| Notifications | Resend (transactional email — planned) |

---

## Repository Structure

```
/
├── src/
│   ├── pages/           # Route-level page components
│   ├── components/      # Shared + layout components
│   │   └── layout/      # AppHeader, RightRail, DemoBanner, UpgradeBanner
│   ├── hooks/           # Custom React hooks (useMachines, useAlerts, …)
│   ├── contexts/        # AuthContext (session + subscription state)
│   ├── data/            # mockData.ts — demo mode data (no backend needed)
│   ├── lib/             # supabase.ts client, utils.ts
│   └── types/           # Shared TypeScript interfaces
├── supabase/
│   ├── migrations/      # SQL migrations (001–004)
│   ├── functions/       # Deno Edge Functions
│   └── seed.sql         # Development seed data
├── capacitor.config.ts  # Capacitor native app config
└── vercel.json          # Deployment config + security headers
```

---

## Demo Mode

When `VITE_SUPABASE_URL` is unset or a placeholder, `isDemoMode = true`. In demo mode:

- All data comes from `src/data/mockData.ts` (12 global machines, 10 alerts, mock orders)
- Auth is bypassed — the app loads immediately with a mock profile
- No real Supabase or Stripe calls are made
- The Admin panel is accessible (useful for showcasing features)
- All write operations (add machine, acknowledge alert, submit fill run) update React state only — no persistence

This lets anyone evaluate the full product at `vend-smart.vercel.app` with zero setup.

---

## Authentication

- Supabase Auth (email/password, Google OAuth planned)
- Session stored in Supabase's own storage (no `localStorage` or `sessionStorage` by app code)
- `AuthContext` provides `user`, `profile`, `subscription`, `signOut`, `isDemoMode`
- Protected routes redirect to `/login` when unauthenticated (skipped in demo mode)

---

## Database Schema (Supabase Postgres)

### `profiles`
User account record, one-to-one with `auth.users`.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | = auth.uid() |
| business_name | text | |
| email | text | |
| is_super_admin | boolean | Admin panel access |
| is_demo | boolean | Demo account guard |
| home_currency | char(3) | ISO 4217, default USD |
| timezone | varchar(50) | IANA tz, default UTC |
| feature_flags | jsonb | Per-account feature toggles |

### `subscriptions`
Billing plan record, one-to-one with `profiles`.

| Column | Type | Notes |
|--------|------|-------|
| plan | enum | free / operator / pro / business / enterprise |
| machine_limit | integer | -1 = unlimited |
| status | text | active / trialing / past_due / canceled |
| stripe_customer_id | text | Server-side only |
| stripe_subscription_id | text | Server-side only |
| current_period_end | timestamptz | |

### `machines`
Fleet units owned by a user.

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid FK | RLS: only owner can read/write |
| name | text | |
| location_address | text | |
| latitude / longitude | float8 | WGS-84 |
| country | char(2) | ISO 3166 alpha-2 |
| currency | char(3) | ISO 4217, default USD |
| timezone | varchar(50) | IANA tz |
| machine_type | enum | snack / drink / combo |
| status | enum | online / offline / low_stock / critical |
| fill_percentage | integer | 0–100 |
| weekly_revenue | numeric | In machine's local currency |
| capacity_slots | integer | |
| commission_percent | numeric | |
| site_type | enum | office / hospital / transit / … |

### `alerts`
Machine-level anomaly alerts.

| Column | Type | Notes |
|--------|------|-------|
| machine_id | uuid FK | |
| alert_type | enum | low_stock / machine_offline / maintenance_due / revenue_drop |
| severity | enum | critical / warning / info |
| acknowledged | boolean | |

### `audit_logs`
Append-only security audit trail.

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | Who performed the action |
| action | text | e.g. `impersonate`, `delete_machine` |
| resource | text | Table name |
| resource_id | text | |
| metadata | jsonb | Before/after snapshots |
| ip_address | text | |

### `admin_impersonation_sessions`
Time-limited admin-as-tenant sessions (1-hour expiry).

---

## Row-Level Security (RLS)

Every table has RLS enabled. Standard pattern:

```sql
-- Users can only see their own rows
CREATE POLICY "user owns row" ON machines
  FOR ALL USING ((SELECT auth.uid()) = user_id);
```

Note: `(SELECT auth.uid())` is used (not `auth.uid()`) — this prevents repeated function calls per row, which is a Postgres query-plan performance pattern.

Super-admins bypass via:

```sql
CREATE POLICY "super admin bypass" ON machines
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND is_super_admin = TRUE)
  );
```

---

## Billing (Stripe)

1. User clicks "Upgrade" → `SettingsPage` calls Supabase Edge Function `create-checkout-session`
2. Edge Function creates a Stripe Checkout Session (server-side, using `STRIPE_SECRET_KEY` — never exposed to browser)
3. Returns a `url` → browser redirects to Stripe-hosted checkout
4. On success, Stripe fires a webhook → `stripe-webhook` Edge Function updates `subscriptions` table
5. `machine_limit` is enforced in `UpgradeBanner` (UI) and DB triggers (hard enforcement)

**Key constraint:** Stripe keys are only ever in Edge Functions environment variables. They are never `VITE_*` variables.

---

## Mobile (Capacitor)

The iOS and Android apps are wrappers around the web app — no separate codebase.

```
npm run build          # Build the web app to dist/
npx cap sync           # Copy dist/ into iOS/Android native projects
npx cap open ios       # Open Xcode
npx cap open android   # Open Android Studio
```

**Native plugins used:**
- `@capacitor/push-notifications` — CRITICAL alert delivery
- `@capacitor/local-notifications` — offline alert queuing
- `@capacitor/camera` — fill-run photo capture
- `@capacitor/geolocation` — nearest-machine routing
- `@capacitor/haptics` — touch feedback on fill-run inputs

**Billing:** Stripe web checkout only (in-app browser). Apple/Google IAP is deliberately avoided to retain 100% of revenue (vs. 15–30% platform cut). This is allowed because VendSmart is a B2B SaaS tool, not a consumer content app.

---

## Security Model

| Concern | Mitigation |
|---------|-----------|
| Secrets in browser | All keys (Stripe, service-role) only in Edge Function env vars. `VITE_*` vars contain only public anon key. |
| Demo account charges | `prevent_demo_account_orders` DB trigger blocks non-draft orders from demo account |
| Admin access | `is_super_admin` flag + RLS bypass policy. Frontend gating is defense-in-depth only. |
| Impersonation | Requires `audit_logs` INSERT (DB trigger). Time-limited (1 hour). |
| XSS | CSP in `vercel.json` allows only self + specific CDNs. No `unsafe-eval`. |
| Clickjacking | `X-Frame-Options: DENY` |
| CSRF | Supabase JWT auth — no cookie-based sessions |
| SQL injection | All queries use Supabase SDK parameterized calls. No raw SQL in app code. |

---

## Design System

- **Primary accent:** `#00d4c8` (electric teal)
- **Text on teal:** `#0f1117` (dark, for contrast)
- **Page background:** `#0f1117`
- **Surface:** `#161b22`
- **Elevated surface:** `#1c2128`
- **Aesthetic:** Linear/Vercel — flat, no gradients, no glassmorphism, no `uppercase tracking-wider` labels

---

## Pricing Tiers

| Plan | Price | Machine Limit |
|------|-------|---------------|
| Free | $0/mo | 5 |
| Operator | $29/mo | 25 |
| Pro | $79/mo | 100 |
| Business | $199/mo | Unlimited |

Machine limits enforced at DB level via `machine_limit` on `subscriptions`.

---

## Key Design Decisions

**Why Capacitor instead of React Native?**
Single codebase. The web app already works well on mobile screens. Capacitor lets us ship to iOS/Android without a full rewrite, and native plugin access (camera, push, geo) covers all required capabilities.

**Why no Apple/Google IAP?**
VendSmart is a B2B SaaS tool for operators, not a consumer app selling content. Apple's own guidelines allow web-based payments for B2B SaaS. Stripe checkout avoids the 15–30% platform cut on every subscription.

**Why Edge Functions for billing/webhooks?**
Stripe secret keys must never reach the browser. Vercel serverless functions would also work, but Supabase Edge Functions co-locate with the database and are already part of the stack.

**Why `(SELECT auth.uid())` in RLS policies?**
Prevents Postgres from re-evaluating `auth.uid()` for every row in a table scan. The `SELECT` wrapper allows the query planner to treat it as a stable subquery, significantly improving performance on large tables.

**Why global/multi-currency?**
Vending operators exist worldwide. Hardcoding USD and US locations would exclude most of the addressable market. Each machine stores its own `currency` and `timezone`; the UI formats values in the machine's local currency using `Intl.NumberFormat`.
