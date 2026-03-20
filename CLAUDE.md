# BUOY.fish Marketing Website

## What This Is

The public-facing marketing website for BUOY.fish — a company that builds GPS tracking buoys to help fishermen locate their deployed set-gear and prevent ghost gear (lost/abandoned fishing equipment that continues to trap marine life).

**Live staging:** Deployed to Cloudflare Pages
**Production app:** https://app.buoy.fish (separate Elixir/Phoenix app)
**Old website:** `../buoy-fish/` (Astro-based, being replaced by this site)

## Tech Stack

- **Framework:** SvelteKit 5 + Svelte 5 + TypeScript
- **Styling:** Tailwind CSS 3.4 + DaisyUI 4.7 (custom theme `saasstartertheme`)
- **Backend:** Supabase (auth + PostgreSQL), Stripe (payments), Resend (email)
- **Hosting:** Cloudflare Pages + Workers
- **Build:** Vite 5, deployed via `deploy/prod.sh` + Wrangler

## Project Structure

```
src/
  config.ts              # Site name, URL, description
  routes/
    (marketing)/         # Public pages: home, pricing, blog, contact, login
      +page.svelte       # Homepage — hero video with typewriter animation
      +layout.svelte     # Navbar + footer for marketing pages
      pricing/           # Pricing page + pricing_plans.ts
      blog/              # Blog listing + posts in (posts)/ subdirectory
      contact_us/        # Contact form (Supabase contact_requests table)
      login/             # Auth flows (Supabase Auth UI)
    (admin)/account/     # Authenticated dashboard, billing, settings
static/
  images/                # Logos (buoy_logo.svg, buoy_logo_dark.png)
  videos/                # Hero video (hero-video-optimized.webm/.mp4)
```

## Theme Colors

- Primary: `#180042` (dark purple)
- Secondary: `#c7b9f8` (light purple)
- Accent: `#db2777` (pink)
- Base: `#fefbf6` (cream)

## Key Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run check        # Svelte type checking
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest
```

## Environment Variables

See `.env.example` — requires Supabase URL/keys, Stripe API key, and optionally Resend for email.

## Company Context

BUOY.fish helps commercial fishermen track deployed set-gear (crab pots, longlines, etc.) using ruggedized GPS trackers on a low-power, long-range wireless network (Helium/LoRaWAN). The core mission is preventing ghost gear — lost fishing equipment that kills marine life and damages ocean ecosystems.

**Active trials:** Baja California (2 trials), Nova Scotia (1 trial), Costa Rica (upcoming)
**Demo:** https://app.buoy.fish/demo
**Founders:** Jameson, Tal

## Git Conventions

- AI agents: work on feature branches only, never push to main/master
- User reviews before merging
