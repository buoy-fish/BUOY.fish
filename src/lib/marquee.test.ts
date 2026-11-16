import { describe, expect, it } from "vitest"
import { stepTarget, wrapTime } from "./marquee"

// The drift is one infinite animation whose currentTime is a position on the
// loop. Dragging and the arrows move currentTime directly, so any value they
// produce has to fold back into one loop, [0, duration).
describe("wrapTime", () => {
  it("leaves a time inside the loop alone", () => {
    expect(wrapTime(1500, 23200)).toBe(1500)
  })

  it("folds a time past the end back to the start", () => {
    expect(wrapTime(23200 + 400, 23200)).toBe(400)
  })

  it("folds a negative time (dragging backwards past the start) to the end", () => {
    expect(wrapTime(-400, 23200)).toBe(22800)
  })

  it("folds times several loops away", () => {
    expect(wrapTime(3 * 23200 + 10, 23200)).toBe(10)
    expect(wrapTime(-3 * 23200 - 10, 23200)).toBe(23190)
  })
})

// An arrow moves the strip one logo, and lands on a logo boundary even when the
// drift (or a drag) left it part-way between two.
describe("stepTarget", () => {
  const slot = 3867 // ms of drift per logo

  it("steps one logo forward from a boundary", () => {
    expect(stepTarget(2 * slot, slot, 1)).toBe(3 * slot)
  })

  it("steps one logo back from a boundary", () => {
    expect(stepTarget(2 * slot, slot, -1)).toBe(slot)
  })

  it("from part-way, steps relative to the nearest logo", () => {
    expect(stepTarget(2 * slot + 100, slot, 1)).toBe(3 * slot)
    expect(stepTarget(2 * slot + slot - 100, slot, 1)).toBe(4 * slot)
    expect(stepTarget(2 * slot + 100, slot, -1)).toBe(slot)
  })
})
