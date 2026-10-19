import deploymentsData from "./deployments.json"

/**
 * The public deployment stage shown as a pill on the homepage Deployments
 * tiles. This is a fixed, marketing-facing vocabulary — deliberately NOT the
 * app's internal project `status` (proposed/active/paused/archived). See
 * app.buoy.fish ADR-0009: a deployment reads "Completed" once the gear is in
 * the water, even while the project stays internally `active` for years.
 */
export type DeploymentStage = "planned" | "in_progress" | "completed"

export type Deployment = {
  /**
   * The single join key tying project ↔ deployment tile ↔ blog post. Matches
   * the app project's `website_slug` and the blog post's `(posts)/<slug>/`
   * folder + `posts.ts` link (`/blog/<slug>`).
   */
  slug: string
  title: string
  stage: DeploymentStage
  blurb: string
  /** The app project's `code`, which is also its map.buoy.fish path. */
  app_code?: string
  /** Go-live date (YYYY-MM-DD); starts the coverage timeline playback. */
  started_on?: string
}

export const deployments: Deployment[] = deploymentsData as Deployment[]

const MAP_BASE = "https://map.buoy.fish"

/**
 * Deep links into map.buoy.fish for a deployment: its coverage map, and the
 * coverage timeline played from go-live (format from map.buoy.fish's
 * assets/js/utils/timelineLink.js). Null when there is no app project.
 */
export function mapLinks(
  d: Deployment,
): { coverage: string; timeline: string | null } | null {
  if (!d.app_code) return null
  const code = encodeURIComponent(d.app_code)
  return {
    coverage: `${MAP_BASE}/${code}`,
    timeline: d.started_on
      ? `${MAP_BASE}/?play=${code}&start=${d.started_on}`
      : null,
  }
}

/** Pill label + DaisyUI badge class per stage. */
export const stageMeta: Record<
  DeploymentStage,
  { label: string; badgeClass: string }
> = {
  planned: { label: "Planned", badgeClass: "badge-secondary" },
  in_progress: { label: "In Progress", badgeClass: "badge-info" },
  completed: { label: "Completed", badgeClass: "badge-success" },
}
