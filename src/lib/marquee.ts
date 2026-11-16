// Fold any animation time into one loop, [0, duration). A drag or an arrow
// can push the drift's currentTime past either end of the loop.
export function wrapTime(time: number, duration: number): number {
  return ((time % duration) + duration) % duration
}

// Where one arrow press moves the drift: one logo (`slot` ms of drift) forward
// or back from the nearest logo boundary, so it lands squarely on a logo even
// when the strip stopped part-way between two.
export function stepTarget(
  time: number,
  slot: number,
  direction: 1 | -1,
): number {
  return (Math.round(time / slot) + direction) * slot
}
