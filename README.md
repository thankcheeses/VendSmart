# VendSmart

Vending fleet management — machine registry, restock routing, alerts and revenue
analytics. React + Vite frontend with a Supabase backend.

**Live:** https://thankcheeses.github.io/VendSmart/

> Under construction.

## Quick start

```bash
npm install
npm run dev
```

With no environment variables set, the app runs in **Demo Mode** against mock
data — no Supabase project required.

## Setup

To point it at a real backend, copy `.env.example` to `.env.local` and fill in
your Supabase URL and anon key. Full instructions, including the database
migrations, are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Deployment

Pushes to `main` are built and published to GitHub Pages by
`.github/workflows/deploy-pages.yml`. Enable it once under
**Settings → Pages → Source → GitHub Actions**; see
[DEPLOYMENT.md](DEPLOYMENT.md) for the subpath and deep-link details.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build with relative asset paths |
| `npm run build:pages` | Production build plus the `404.html` deep-link fallback |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the last build locally |
| `npm run cap:ios` / `cap:android` | Capacitor native builds |
