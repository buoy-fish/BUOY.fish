export type TrackGeometry = {
  scrollLeft: number
  clientWidth: number
  scrollWidth: number
}

// Where an auto-rotating scroll track should go next: one step forward, or
// back to the start once it reaches the end. Returns null when the content fits
// and there is nothing to rotate. The jump back to the start is a deliberate
// simplification. A seamless infinite loop would need duplicated items.
export function nextCarouselLeft(
  { scrollLeft, clientWidth, scrollWidth }: TrackGeometry,
  step: number,
): number | null {
  const maxLeft = scrollWidth - clientWidth
  if (maxLeft <= 1) return null
  if (scrollLeft >= maxLeft - 1) return 0
  return scrollLeft + step
}
