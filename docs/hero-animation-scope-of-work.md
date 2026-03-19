# BUOY.fish Hero Animation — Scope of Work for Motion/Web Designer

## Overview

BUOY.fish is a company that builds GPS tracking buoys for commercial fishermen. Our marketing website (https://next.buoy.fish) features a full-screen hero video of a fishing boat at sunset in Baja California. Over this video, we display an animated "HUD" card showing live buoy telemetry data (GPS coordinates, battery, temperature, signal strength).

We're looking for a motion/web designer to elevate this hero section into a polished, professional experience that visually communicates what our product does: **track fishing gear in real time over long-range wireless networks**.

## Current State

- **Video**: 24-second looping clip of a fishing boat at sunset (Punta Abreojos, Mexico), served as MP4/WebM
- **Overlay**: A floating telemetry card appears ~5.5s into the video showing simulated buoy data (coordinates, battery, temp, signal, last ping). Built in HTML/CSS/JS (Svelte component), positioned over the video
- **Problem**: The overlay positioning is static and doesn't feel connected to the buoy in the video. The visual relationship between the physical buoy and its data readout is unclear

## What We Want

### Primary Deliverable: Animated Hero Interaction Design

Design and implement (or spec for implementation) an animated overlay experience that:

1. **Visually connects the buoy in the video to its data readout** — e.g., animated dashed lines, signal pulses, or a visual "connection" that makes it clear the data is *coming from* the buoy
2. **Incorporates a map visualization** — could be a small inset map showing the buoy's location (Punta Abreojos, Mexico), similar to our production app's map view. Could be a screenshot of our app with design augmentations, or a custom illustration
3. **Feels polished and intentional** — smooth timing, appropriate easing, clear visual hierarchy
4. **Works responsively** — desktop gets the full experience; mobile gets a compact version (currently a top bar) that doesn't obstruct the video

### Optional Enhancements
- Animated signal waves emanating from the buoy
- A subtle "scanning" or "connecting" animation before the data card appears
- Map zoom-in animation showing where in the world this buoy is
- Multiple buoy dots on the map showing the scale of the deployment

## Technical Context

### Stack
- **Framework**: SvelteKit 5 + TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Hosting**: Cloudflare Pages
- **Repo**: GitHub (we can grant contributor access)

### How the overlay works
The overlay is a Svelte component (`src/routes/(marketing)/+page.svelte`) that listens to the video's `timeupdate` event. At specific timestamps, it shows/hides elements with CSS transitions. The buoy data is simulated in JS with gentle random drift to look "live."

### File locations
```
src/routes/(marketing)/+page.svelte    # Hero section + overlay logic
src/routes/(marketing)/+layout.svelte  # Navbar + footer
static/videos/hero-video-optimized.*   # Hero video (MP4 + WebM)
static/images/                         # Logos, poster image
```

## Delivery Options (pick one)

### Option A: Work directly in the codebase (preferred)
- We grant you access to the GitHub repo
- You create a feature branch and implement the animations in the Svelte component
- Use CSS animations, SVG, Lottie, or GSAP — whatever produces the best result
- We review via PR

### Option B: Design spec + assets
- Deliver a Figma file with:
  - Exact positions/sizes of all overlay elements (as % of viewport)
  - Animation timeline with easing curves and durations
  - Any custom assets (SVG illustrations, Lottie JSON, map graphics)
- We implement from the spec

### Option C: Composite video (simplest but least flexible)
- Deliver a new hero video (MP4 + WebM) with all overlays baked in via After Effects/Motion
- Pros: pixel-perfect
- Cons: can't be interactive, harder to iterate, larger file size

## Assets We'll Provide

1. **Hero video** (raw + optimized) — available in the repo at `static/videos/`
2. **Logo files** (PNG, SVG) — in `static/images/` and Dropbox
3. **Production app screenshots** — showing our real map view and telemetry UI for reference
4. **Brand colors**: Primary `#180042` (dark purple), Secondary `#c7b9f8` (light purple), Accent `#db2777` (pink), Base `#fefbf6` (cream), Orange `#f97316` (logo)
5. **Git repo access** upon request

## Sharing the Video File

The hero video is tracked in git. To share it:

```bash
# Clone the repo (video is included)
git clone https://github.com/buoy-fish/BUOY.fish.git
cd BUOY.fish/static/videos/

# Files:
# hero-video-optimized.mp4 (7.5MB, 720p, 24s)
# hero-video-optimized.webm (16MB, 720p, 24s)
```

Or download directly from the deployed site:
- https://buoy-staging.pages.dev/videos/hero-video-optimized.mp4

For the raw/higher-res version, contact Jameson.

## Timeline & Budget

- **Timeline**: [TBD — suggest 1-2 weeks for Option A or B]
- **Budget**: [TBD — typical range for this scope: $1,500-$4,000 depending on complexity]

## Contact

- Jameson — hello@buoy.fish
- Project repo: https://github.com/buoy-fish/BUOY.fish
