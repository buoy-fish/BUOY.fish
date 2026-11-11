// A looping carousel renders its items several times over and keeps the scroll
// position inside the second copy, [setWidth, 2 * setWidth). Every copy looks
// the same, so snapping a position back into that range is invisible, and there
// is always a full copy on either side to scroll or drag into.
export function wrapScroll(scrollLeft: number, setWidth: number): number {
  if (setWidth <= 0) return scrollLeft
  const offset = (((scrollLeft - setWidth) % setWidth) + setWidth) % setWidth
  return setWidth + offset
}

// The scroll position one logo forward or back, landing on a logo boundary
// (a multiple of `step`) even when a drag left the track between two logos.
export function nextStop(
  scrollLeft: number,
  step: number,
  direction: 1 | -1,
): number {
  return Math.round(scrollLeft / step + direction) * step
}
