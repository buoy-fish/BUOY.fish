# Statement of Work: Hero Video Overlay Animation

**Project:** BUOY.fish Marketing Website — Hero Section Enhancement
**Date:** 2026-03-20
**Status:** Draft

---

## Objective

Create a motion-designed overlay animation that visually connects the buoy visible in the hero video to a floating data HUD card, so the viewer understands that the live telemetry data is coming _from_ that specific buoy. The animation must work across mobile, desktop, and fullscreen viewports.

## Background

BUOY.fish builds GPS tracking buoys for commercial fishermen. Our homepage features a looping hero video of buoys deployed in the ocean. Currently, a floating "inspector HUD" card appears ~5.5 seconds into the video showing simulated live telemetry (GPS coordinates, battery, temperature, signal strength). The card simply fades in — there is no visual connection between the buoy in the video and the data card. We want to fix that.

### What exists today

- A full-viewport looping hero video (WebM 16MB / MP4 7.5MB) showing buoys on the ocean
- A glassmorphism-styled HUD card that fades in at 5.5s and fades out at 20s
- Desktop: 320px floating card positioned at `top: 20%, left: 12%`
- Mobile: full-width compact bar positioned below the navbar
- Data updates every 2-3 seconds (coordinate drift, battery fluctuation, signal metrics)
- Built with SvelteKit 5, Tailwind CSS, no animation libraries currently installed

### What we want

An animated visual element (line, arc, particle trail, or similar) that:

1. **Originates from the buoy** visible in the video frame
2. **Leads to the HUD card**, drawing the viewer's eye and establishing the data-to-source relationship
3. **Adapts to viewport size** — the buoy's apparent position in the video shifts as the viewport changes (object-cover crops differently), and the HUD card position also changes between mobile/desktop layouts
4. **Feels like a live data link** — not a static line, but something with subtle motion (pulse, glow, particle flow, dash animation, etc.)

## Deliverables

The contractor delivers **overlay assets and animation files**. The BUOY.fish development team handles all code integration (Svelte components, positioning logic, responsive behavior, video sync timing).

### Required deliverables

| #   | Deliverable                                                           | Format                                      | Notes                                                                                                                                  |
| --- | --------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Connector animation** — the line/arc/trail from buoy to HUD card    | Lottie JSON (preferred) or SVG sprite sheet | Must have transparent background. Lottie preferred for smallest file size and programmatic control (playback speed, direction, color). |
| 2   | **HUD card entrance animation** — replaces the current simple fade-in | Lottie JSON or CSS animation spec           | The card should feel like it "materializes" or "boots up" in sync with the connector reaching it.                                      |
| 3   | **Design mockups** — showing the overlay at 3 viewport sizes          | PNG/Figma                                   | Mobile (~375px), Desktop (~1440px), Ultrawide (~2560px). These are reference only — exact positioning will be handled in code.         |
| 4   | **Animation timing spec**                                             | Document or annotated video                 | Describing durations, easing curves, and sequencing (e.g., "connector draws over 800ms ease-out, then card materializes over 400ms").  |

### Nice-to-have deliverables

| #   | Deliverable                               | Format      | Notes                                                                                                                                      |
| --- | ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 5   | **Idle/loop animation** for the connector | Lottie JSON | Subtle pulse, particle flow, or dash march that plays while the HUD is visible (between 5.5s–20s).                                         |
| 6   | **Disconnect/fade-out animation**         | Lottie JSON | Reverse of entrance — connector retracts and card dissolves when the HUD exits at 20s.                                                     |
| 7   | **Mobile-specific variant**               | Lottie JSON | If the mobile layout requires a fundamentally different animation (e.g., vertical line up to the top bar vs. diagonal arc to a side card). |

## Technical Context for Contractor

### The video

- **Content:** Ocean surface footage with BUOY.fish GPS buoys visible. The buoy of interest is roughly center-frame.
- **Formats:** WebM (VP9, 16MB) and MP4 (H.264, 7.5MB), both optimized for streaming.
- **Behavior:** Autoplays muted, loops continuously. Uses `object-cover` CSS, meaning the visible portion of the video changes with viewport aspect ratio.
- **Important:** The video is a _background element_. Overlays are HTML/SVG/Canvas elements positioned absolutely on top of it, not composited into the video file.

### The HUD card

- **Desktop:** Absolute positioned at `top: 20%; left: 12%` within the hero container, 320px wide.
- **Mobile (< 768px):** Full-width bar at `top: 120px`, compact layout with fewer data fields.
- **Styling:** Dark glassmorphism panel — `rgba(10, 20, 40, 0.75)` background, 12px backdrop blur, monospace font, green accent for live indicators.
- **Timing:** Appears at 5.5s into the video, disappears at 20s. Currently uses a simple 800ms fade transition.

### The connector's challenge: responsive anchoring

The connector animation must bridge two points that both move as the viewport changes:

1. **Source point (buoy in video):** Because the video uses `object-cover`, the buoy's apparent screen position shifts depending on viewport aspect ratio. On ultrawide screens, vertical cropping moves the buoy down; on tall/narrow screens, horizontal cropping moves it right. The development team will calculate the buoy's screen coordinates programmatically — the animation asset just needs to support **dynamic start/end points**.

2. **Target point (HUD card):** Moves between two completely different positions and layouts depending on screen width (desktop floating card vs. mobile top bar).

**What this means for the animation design:**

- The connector should be designed as a **flexible path** — not a fixed-shape animation baked to specific pixel coordinates.
- Ideal approach: a Lottie animation where the path endpoints can be programmatically updated, OR a set of SVG path segments that the dev team can dynamically compose.
- Alternatively: design 2-3 variants (mobile, desktop, ultrawide) and the dev team will swap between them at breakpoints.

### Tech stack (for reference, not required knowledge)

- **Framework:** SvelteKit 5 + Svelte 5 (TypeScript)
- **Styling:** Tailwind CSS 3.4 + DaisyUI
- **Current animations:** Svelte's built-in `fade` transition, Tailwind utility classes only
- **Planned addition:** `lottie-web` or `@lottiefiles/svelte-lottie-player` for Lottie playback (dev team will install and integrate)
- **Hosting:** Cloudflare Pages (static assets served via CDN)

## Skills Required

The ideal contractor has:

- **Motion design** — After Effects, Rive, or similar tool for creating connector/trail animations
- **Lottie export experience** — Bodymovin plugin for AE, or Rive-to-Lottie export. Understanding of what AE features are Lottie-compatible (no expressions, limited effects).
- **Web animation awareness** — Understanding that this is an HTML overlay, not video compositing. Familiarity with how `object-cover` works and why fixed pixel positions don't work across viewports.
- **UI/HUD design sensibility** — The aesthetic is "tactical/technical" — think flight HUD, sonar display, mission control. Not playful or cartoonish.

**Not required:** The contractor does NOT need to write any code, know Svelte/JavaScript, or modify the website. They deliver assets; we integrate.

## Design Direction & Inspiration

The visual language should feel like:

- A **sonar ping** or **radar sweep** connecting to a target
- A **data uplink** — the buoy is transmitting and the HUD is receiving
- Subtle sci-fi/tactical aesthetic that matches the existing HUD card's dark glassmorphism style

Possible animation approaches (contractor should propose their recommendation):

1. **Animated dashed line** — A path draws from buoy to card with dashed stroke, then pulses in idle state
2. **Particle trail** — Small dots/particles flow along a curved path from buoy to card
3. **Beam/pulse** — A thin beam connects the two points with periodic pulse waves traveling along it
4. **Expanding rings + connector** — Concentric rings emanate from the buoy (like sonar), then a line extends to the card

### Color palette

- Primary: `#180042` (dark purple)
- Secondary: `#c7b9f8` (light purple)
- Accent: `#db2777` (pink)
- HUD green: `#4ade80` (used for LIVE indicator and status)
- HUD text: `rgba(255, 255, 255, 0.9)`
- HUD muted: `rgba(255, 255, 255, 0.4)`

The connector animation should likely use the HUD green or a cyan/teal (#22d3ee) to suggest a "data link" without clashing with the existing palette.

## Timeline & Budget

| Phase          | Duration | Description                                                                                                      |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| **Concept**    | 3-5 days | Contractor reviews video + current HUD, proposes 2-3 animation concepts (static mockups or rough video sketches) |
| **Review**     | 1-2 days | BUOY.fish team selects direction, provides feedback                                                              |
| **Production** | 5-7 days | Contractor produces final Lottie/SVG assets + timing spec                                                        |
| **Revision**   | 3-5 days | One round of revisions after dev team integration testing                                                        |

**Estimated total:** 2-3 weeks

Budget: [TBD — discuss with contractor. Expect $1,500–$4,000 depending on complexity and number of variants.]

## Success Criteria

1. A viewer watching the hero video intuitively understands that the data card is showing information _from the buoy in the water_
2. The animation feels premium and polished, not like an afterthought
3. Works visually at mobile (375px), tablet (768px), desktop (1440px), and ultrawide (2560px) — even if this requires multiple animation variants
4. Total added asset size (all Lottie JSONs) is under 150KB
5. Animation does not cause jank or dropped frames on mid-range mobile devices
6. The dev team can integrate without needing to modify the video file itself

## Reference Files

The contractor will need access to:

- [ ] The hero video source file (highest resolution available, not the web-optimized version)
- [ ] A screen recording of the current HUD overlay behavior
- [ ] The live staging URL to interact with the current implementation
- [ ] This document

## Open Questions

1. Should the connector originate from a specific point on the buoy (e.g., antenna tip), or from a general "area" with a highlight ring?
2. Do we want the mobile experience to have the same connector animation, or a simplified version (e.g., just a pulse ring on the buoy with no drawn path)?
3. Are we okay with the buoy's anchor point being approximate (since the video shifts with object-cover), or do we need pixel-precise tracking?
4. Future consideration: if we swap the hero video for different seasons/campaigns, should the connector system be designed to work with any video (generic anchor point), or is it tuned to this specific video?
