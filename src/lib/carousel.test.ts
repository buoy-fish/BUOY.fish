import { describe, expect, it } from "vitest"
import { nextCarouselLeft } from "./carousel"

// A 600px-wide viewport over a 1400px-wide track: max scrollLeft is 800.
const track = { clientWidth: 600, scrollWidth: 1400 }

describe("nextCarouselLeft", () => {
  it("advances one step from the start", () => {
    expect(nextCarouselLeft({ ...track, scrollLeft: 0 }, 230)).toBe(230)
  })

  it("wraps to the start once the track is scrolled to the end", () => {
    expect(nextCarouselLeft({ ...track, scrollLeft: 800 }, 230)).toBe(0)
  })

  it("treats sub-pixel rounding at the end as the end", () => {
    expect(nextCarouselLeft({ ...track, scrollLeft: 799.5 }, 230)).toBe(0)
  })

  it("returns null when everything fits and there is nothing to rotate", () => {
    expect(
      nextCarouselLeft(
        { scrollLeft: 0, clientWidth: 1400, scrollWidth: 1400 },
        230,
      ),
    ).toBeNull()
  })
})
