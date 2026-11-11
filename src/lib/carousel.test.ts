import { describe, expect, it } from "vitest"
import { nextStop, wrapScroll } from "./carousel"

// One set of logos is 1392px wide; the home range is the second copy,
// [1392, 2784), so there is always an identical copy on either side.
const SET = 1392

describe("wrapScroll", () => {
  it("leaves a position inside the home copy alone", () => {
    expect(wrapScroll(1500, SET)).toBe(1500)
  })

  it("moves a position past the home copy back by one set", () => {
    expect(wrapScroll(2784 + 232, SET)).toBe(1392 + 232)
  })

  it("moves a position before the home copy forward by one set", () => {
    expect(wrapScroll(1392 - 232, SET)).toBe(2784 - 232)
  })

  it("wraps positions several sets away, as a long drag produces", () => {
    expect(wrapScroll(-100, SET)).toBe(2784 - 100)
    expect(wrapScroll(5 * SET + 10, SET)).toBe(SET + 10)
  })

  it("does nothing before the track has been measured", () => {
    expect(wrapScroll(300, 0)).toBe(300)
  })
})

describe("nextStop", () => {
  const STEP = 232

  it("advances one logo from an aligned position", () => {
    expect(nextStop(1392, STEP, 1)).toBe(1624)
    expect(nextStop(1392, STEP, -1)).toBe(1160)
  })

  it("lands back on a logo boundary after a drag left it between two", () => {
    expect(nextStop(1676, STEP, 1)).toBe(1856)
    expect(nextStop(1676, STEP, -1)).toBe(1392)
  })
})
