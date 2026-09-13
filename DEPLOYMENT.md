# VendSmart — Deployment Guide

## Overview

VendSmart is a React + Vite frontend with a Supabase backend, deployed to **GitHub Pages** by a GitHub Actions workflow.

Without any environment variables, the app runs in **Demo Mode** with mock data — no Supabase project needed, so the very first deploy works with zero configuration.

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

For local development, create a `.env.local` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

For the deployed site, add the same two as **repository secrets** — the Pages
workflow reads them at build time:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your anon / public key |

Leave them unset to keep the deployed site in Demo Mode.

> **Note:** `VITE_*` values are compiled into the JavaScript bundle and are
> publicly readable. Only the anon key belongs here — it is designed to be
> public and is safe *provided* row-level security is enabled on every table
> (migration `001_initial_schema.sql` does this). Never put the service role
> key in a `VITE_*` variable or a Pages build.

---

## Step 5: Deploy to GitHub Pages

### One-time setup

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it. There is nothing to select beyond the source — the workflow at
`.github/workflows/deploy-pages.yml` supplies the build.

### Deploying

Every push to `main` builds and publishes automatically. You can also trigger a
deploy by hand from **Actions → Deploy to GitHub Pages → Run workflow**.

Your site lands at:

```
https://<your-github-username>.github.io/<repo-name>/
```

For this repo that is <https://thankcheeses.github.io/VendSmart/>.

### How the subpath is handled

Project pages are served from `/<repo-name>/` rather than the domain root, which
breaks the two assumptions a Vite SPA makes by default:

- **Asset URLs.** The workflow sets `VITE_BASE_PATH=/<repo-name>/`, which Vite
  bakes into every script, stylesheet and image URL. Builds without that
  variable — local `npm run build`, and Capacitor native builds — keep relative
  paths and are unaffected.
- **Router paths.** `src/App.tsx` passes Vite's `BASE_URL` to React Router as its
  `basename`, so in-app routes stay written as `/machines` while the browser
  shows `/VendSmart/machines`.

### How deep links are handled

GitHub Pages serves static files with no rewrite rules, so a hard refresh on
`/VendSmart/machines` would normally hit a missing file. Pages falls back to
`404.html` for any unmatched path, so `npm run build:pages` copies the built
`index.html` to `dist/404.html`. The app shell boots, React Router reads the
real URL, and the right page renders.

One consequence worth knowing: those deep links are served with an HTTP **404
status** even though the correct page renders. Browsers and users never notice,
but crawlers and uptime checks will — point any monitoring at the site root,
which returns a normal 200.

`public/.nojekyll` is also published, which stops Pages from discarding
Vite's underscore-prefixed chunk filenames.

### Using a custom domain

1. Add a `CNAME` file containing your domain to `public/`.
2. Set the domain under **Settings → Pages → Custom domain**.
3. The site now serves from the domain root, so drop the `VITE_BASE_PATH` line
   from `.github/workflows/deploy-pages.yml` (or set it to `/`).

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
4. Add the publishable key as a repository secret (`VITE_STRIPE_PUBLISHABLE_KEY`)
   and wire it into the `env:` block of the workflow's build step alongside the
   Supabase vars. The secret key is an Edge Function secret and must never reach
   a Pages build:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```
5. Create a Supabase Edge Function to handle Stripe webhooks (see `supabase/functions/` for examples).
6. Update `src/pages/SettingsPage.tsx` — replace the `handleUpgrade` alert with a real Stripe Checkout redirect.

---

## Auth Configuration

In your Supabase project:

1. Go to **Auth → Settings**.
2. Set **Site URL** to your Pages URL, including the repo subpath and trailing
   slash (e.g., `https://thankcheeses.github.io/VendSmart/`).
3. Add the same URL to **Redirect URLs**. Supabase matches these exactly, so the
   subpath and trailing slash both matter.
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
├── .github/workflows/
│   └── deploy-pages.yml     # Builds and publishes to GitHub Pages
├── scripts/
│   └── gh-pages-postbuild.mjs  # Copies index.html → 404.html for deep links
├── public/
│   └── .nojekyll            # Stops Pages from stripping _-prefixed assets
└── .env.example             # Environment variable template
```

---

## Security Headers

GitHub Pages serves static files and cannot set response headers, so the policy
that previously lived in `vercel.json` now ships as a `<meta>` tag in
`index.html`. The Content-Security-Policy and `Referrer-Policy` carry over
intact.

Three protections cannot be expressed in markup and are lost on Pages:

| Header | Status |
| --- | --- |
| `Content-Security-Policy` | ✅ Preserved via `<meta http-equiv>` |
| `Referrer-Policy` | ✅ Preserved via `<meta name="referrer">` |
| `X-Content-Type-Options: nosniff` | ❌ Not settable — GitHub Pages sends correct MIME types regardless |
| `X-Frame-Options` / CSP `frame-ancestors` | ❌ Not settable — the site can be framed by other origins |
| `Permissions-Policy` | ❌ Not settable — camera and geolocation still prompt normally |

Clickjacking protection is the one with real teeth. If the app handles anything
where that matters, put it behind a CDN that can set headers (Cloudflare in
front of Pages works, and its Transform Rules can add all three back).

The CSP also now allows `https://*.basemaps.cartocdn.com` in `img-src`, which
the restock map's tile layer needs. The Vercel policy omitted it, so map tiles
were being blocked there.
