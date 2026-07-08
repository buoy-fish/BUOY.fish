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
}

export const deployments: Deployment[] = deploymentsData as Deployment[]

/** Pill label + DaisyUI badge class per stage. */
export const stageMeta: Record<
  DeploymentStage,
  { label: string; badgeClass: string }
> = {
  planned: { label: "Planned", badgeClass: "badge-secondary" },
  in_progress: { label: "In Progress", badgeClass: "badge-info" },
  completed: { label: "Completed", badgeClass: "badge-success" },
}
