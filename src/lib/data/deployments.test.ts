import { mapLinks, type Deployment } from "./deployments"

const base: Deployment = {
  slug: "costa-rica-gulf-of-nicoya",
  title: "Gulf of Nicoya, Costa Rica",
  stage: "in_progress",
  blurb: "",
}

describe("mapLinks", () => {
  it("links the project's coverage map and its timeline from go-live", () => {
    expect(
      mapLinks({
        ...base,
        app_code: "gulf-of-nicoya-costa-rica",
        started_on: "2026-07-24",
      }),
    ).toEqual({
      coverage: "https://map.buoy.fish/gulf-of-nicoya-costa-rica",
      timeline:
        "https://map.buoy.fish/?play=gulf-of-nicoya-costa-rica&start=2026-07-24",
    })
  })

  it("omits the timeline when the go-live date is unknown", () => {
    expect(mapLinks({ ...base, app_code: "nova-scotia" })).toEqual({
      coverage: "https://map.buoy.fish/nova-scotia",
      timeline: null,
    })
  })

  it("returns null for a deployment with no app project", () => {
    expect(mapLinks(base)).toBeNull()
  })
})
