// Applies an app.buoy.fish `repository_dispatch` payload to this repo's content
// files. Pure transform functions (unit-tested) + a thin CLI the GitHub Action
// invokes. See app.buoy.fish ADR-0009 for the payload contract.
//
// Kept as plain ESM (.mjs) so the Action runs it with bare `node` — no build,
// no tsx. The logic lives here (not in the Elixir app) because this repo owns
// how it renders itself.

import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"

/** The fixed public deployment-stage vocabulary. Mirrors src/lib/data/deployments.ts. */
export const VALID_STAGES = ["planned", "in_progress", "completed"]

/**
 * Return a new deployments array with `slug`'s stage set to `stage`.
 * Throws (never silently no-ops) on an unknown slug or an invalid stage, so a
 * malformed dispatch fails the Action loudly instead of publishing nothing.
 *
 * @param {Array<{slug: string, stage: string}>} deployments
 * @param {{slug: string, stage: string}} payload
 */
export function applyDeploymentStage(deployments, { slug, stage }) {
  if (!VALID_STAGES.includes(stage)) {
    throw new Error(
      `invalid stage "${stage}" — expected one of ${VALID_STAGES.join(", ")}`,
    )
  }
  if (!deployments.some((d) => d.slug === slug)) {
    throw new Error(
      `unknown deployment slug "${slug}" — not present in deployments.json`,
    )
  }
  return deployments.map((d) => (d.slug === slug ? { ...d, stage } : d))
}

const DEPLOYMENTS_PATH = fileURLToPath(
  new URL("../data/deployments.json", import.meta.url),
)

function readDeployments() {
  return JSON.parse(readFileSync(DEPLOYMENTS_PATH, "utf8"))
}

/** @param {Array<object>} deployments */
function writeDeployments(deployments) {
  writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(deployments, null, 2) + "\n")
}

/**
 * CLI entry. Reads the dispatch type + payload from env (set by the workflow
 * from `github.event.action` / `github.event.client_payload`) and mutates the
 * relevant content files. Exits non-zero on any problem.
 */
function main() {
  const eventType = process.env.EVENT_TYPE
  let payload
  try {
    payload = JSON.parse(process.env.CLIENT_PAYLOAD || "{}")
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`CLIENT_PAYLOAD is not valid JSON: ${msg}`)
    process.exit(1)
  }

  switch (eventType) {
    case "deployment_stage": {
      const updated = applyDeploymentStage(readDeployments(), payload)
      writeDeployments(updated)
      console.log(`deployment_stage: set ${payload.slug} → ${payload.stage}`)
      break
    }
    // Next slice (ADR-0009 §6/§7): convert body_markdown → post .svelte, patch
    // posts.ts, handle R2 image URLs. Stubbed so a premature dispatch fails
    // loudly rather than silently doing nothing.
    case "blog_publish":
    case "tile_remove":
      console.error(`event type "${eventType}" is not implemented yet`)
      process.exit(1)
      break
    default:
      console.error(`unknown event type "${eventType}"`)
      process.exit(1)
  }
}

// Run main only when executed directly (not when imported by tests).
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
