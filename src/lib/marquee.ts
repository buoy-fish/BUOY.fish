// Fold any animation time into one loop, [0, duration). A drag or an arrow
// can push the drift's currentTime past either end of the loop.
export function wrapTime(time: number, duration: number): number {
  return ((time % duration) + duration) % duration
}

// Where one arrow press moves the drift: to the next logo boundary in the
// pressed direction (`slot` ms of drift per logo). From part-way between two
// logos that is less than a full logo, never more; from a boundary it is one.
// A time within EPS_SLOTS of a boundary (a fraction of one logo, not ms)
// counts as on it, so float error from the animation clock can't turn a
// one-logo step into a zero.
const EPS_SLOTS = 1e-3
export function stepTarget(
  time: number,
  slot: number,
  direction: 1 | -1,
): number {
  const pos = time / slot
  const index =
    direction === 1
      ? Math.floor(pos + EPS_SLOTS) + 1
      : Math.ceil(pos - EPS_SLOTS) - 1
  return index * slot
}
