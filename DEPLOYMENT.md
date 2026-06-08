# VendSmart — Deployment Guide

## Overview

VendSmart is a React + Vite frontend with a Supabase backend. It can be deployed to Vercel in under 10 minutes.

Without any environment variables, the app runs in **Demo Mode** with mock data — no Supabase project needed.

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project** → choose organization → enter project name, database password, and region.
3. Wait ~2 minutes for the project to provision.

---

## Step 2: Run the Database Migrations

### Option A — Using the Supabase Dashboard (easiest)

1. In your Supabase project, go to **SQL Editor**.
2. Click **New Query**.
3. Copy the contents of `supabase/migrations/001_initial_schema.sql` and paste it.
4. Click **Run** (or press Cmd/Ctrl + Enter).

### Option B — Using the Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
supabase db push
```

---

## Step 3: Get Your Supabase Keys

1. Go to **Project Settings** → **API** in your Supabase dashboard.
2. Copy:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **anon / public** key

---

## Step 4: Configure Environment Variables

Create a `.env.local` file (or set in Vercel dashboard):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 5: Deploy to Vercel

### Option A — Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel

# Set env vars
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### Option B — Via Vercel Dashboard (GitHub integration)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo.
3. Vercel auto-detects Vite. Leave build settings as-is.
4. Go to **Settings → Environment Variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**.

---

## Step 6: Deploy the Edge Function (Optional — Predictive Restocking)

The `restock-predictor` Edge Function runs daily and creates alerts based on stock velocity.

```bash
# Deploy the function
supabase functions deploy restock-predictor

# Add environment variables to the function
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Test it manually
supabase functions invoke restock-predictor

# Schedule to run daily at 7 AM UTC
# In Supabase Dashboard → Edge Functions → restock-predictor → Schedule
# Cron: 0 7 * * *
```

---

## Step 7: Set Up Stripe Billing (Optional)

1. Create a [Stripe](https://stripe.com) account.
2. Create two products in the Stripe dashboard:
   - **VendSmart Pro** — $49/month (recurring)
   - **VendSmart Enterprise** — custom pricing
3. Get your API keys from the Stripe dashboard.
4. Add to your environment variables:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```
5. Create a Supabase Edge Function to handle Stripe webhooks (see `supabase/functions/` for examples).
6. Update `src/pages/SettingsPage.tsx` — replace the `handleUpgrade` alert with a real Stripe Checkout redirect.

---

## Auth Configuration

In your Supabase project:

1. Go to **Auth → Settings**.
2. Set **Site URL** to your Vercel deployment URL (e.g., `https://vendsmart.vercel.app`).
3. Add the same URL to **Redirect URLs**.
4. Enable **Email** provider (enabled by default).

---

## Seeding Demo Data

After creating your first user account, you can seed demo data:

1. Copy your user ID from **Supabase Dashboard → Auth → Users**.
2. Edit `supabase/seed.sql` — replace `YOUR_USER_ID` with your UUID.
3. Run the seed file in the SQL editor.

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Fill in your Supabase keys

# Start dev server
npm run dev
```

Without env vars, the app runs in Demo Mode with mock data (no Supabase needed for dev).

---

## Architecture

```
VendSmart
├── src/
│   ├── App.tsx              # Routing shell
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles & CSS variables
│   ├── types/               # TypeScript type definitions
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client (null in demo mode)
│   │   └── utils.ts         # Utility functions
│   ├── contexts/
│   │   └── AuthContext.tsx  # Auth state (user, profile, subscription)
│   ├── hooks/
│   │   ├── useMachines.ts   # Machines CRUD + realtime
│   │   ├── useAlerts.ts     # Alerts + realtime subscriptions
│   │   ├── useAnalytics.ts  # Revenue & product data
│   │   └── ...
│   ├── components/
│   │   ├── layout/          # AppHeader, RightRail, banners
│   │   ├── machines/        # MachineDetailPanel
│   │   └── shared/          # MetricCard, StatusBadge, etc.
│   ├── pages/               # Route-level page components
│   └── data/
│       └── mockData.ts      # Demo data (used in demo mode)
├── supabase/
│   ├── migrations/          # SQL schema files
│   ├── seed.sql             # Demo data for Supabase
│   └── functions/
│       └── restock-predictor/  # Daily predictive restocking
├── vercel.json              # Vercel deployment config
└── .env.example             # Environment variable template
```
