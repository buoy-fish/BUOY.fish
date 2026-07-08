import { describe, it, expect } from "vitest"
import { applyDeploymentStage, VALID_STAGES } from "./apply-content-sync.mjs"

const sample = () => [
  {
    slug: "punta-abreojos-deployment",
    title: "A",
    stage: "completed",
    blurb: "x",
  },
  {
    slug: "costa-rica-gulf-of-nicoya",
    title: "B",
    stage: "planned",
    blurb: "y",
  },
]

describe("applyDeploymentStage", () => {
  it("updates the stage of the matching deployment", () => {
    const out = applyDeploymentStage(sample(), {
      slug: "costa-rica-gulf-of-nicoya",
      stage: "in_progress",
    })
    expect(out.find((d) => d.slug === "costa-rica-gulf-of-nicoya")?.stage).toBe(
      "in_progress",
    )
  })

  it("leaves other deployments untouched", () => {
    const out = applyDeploymentStage(sample(), {
      slug: "costa-rica-gulf-of-nicoya",
      stage: "completed",
    })
    expect(out.find((d) => d.slug === "punta-abreojos-deployment")?.stage).toBe(
      "completed",
    )
  })

  it("does not mutate the input array", () => {
    const input = sample()
    applyDeploymentStage(input, {
      slug: "costa-rica-gulf-of-nicoya",
      stage: "in_progress",
    })
    expect(
      input.find((d) => d.slug === "costa-rica-gulf-of-nicoya")?.stage,
    ).toBe("planned")
  })

  it("throws when the slug is not present (never silently no-ops)", () => {
    expect(() =>
      applyDeploymentStage(sample(), { slug: "nope", stage: "completed" }),
    ).toThrow(/unknown deployment slug/i)
  })

  it("throws on an invalid stage value", () => {
    expect(() =>
      applyDeploymentStage(sample(), {
        slug: "costa-rica-gulf-of-nicoya",
        stage: "shipped",
      }),
    ).toThrow(/invalid stage/i)
  })

  it("exposes the fixed stage vocabulary", () => {
    expect(VALID_STAGES).toEqual(["planned", "in_progress", "completed"])
  })
})
