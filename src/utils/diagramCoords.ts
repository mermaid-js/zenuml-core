/**
 * Convert browser client coordinates into the unscaled local coordinates of an
 * element. The diagram can be CSS-scaled by the host or by zoom, so the
 * on-screen rect is `scale` times larger than the element's layout size.
 */

/** On-screen width divided by layout width. 1 before layout or for a zero-size rect. */
export function elementScale(
  el: HTMLElement,
  rect: DOMRect = el.getBoundingClientRect(),
): number {
  return rect.width / (el.offsetWidth || rect.width) || 1;
}

/** A client point, relative to the element's top-left corner, in unscaled units. */
export function clientToLocal(
  el: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  const scale = elementScale(el, rect);
  return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
}

/** A client rect, relative to the element's top-left corner, in unscaled units. */
export function rectToLocal(
  el: HTMLElement,
  target: DOMRect,
): {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} {
  const rect = el.getBoundingClientRect();
  const scale = elementScale(el, rect);
  return {
    x: (target.left - rect.left) / scale,
    y: (target.top - rect.top) / scale,
    width: target.width / scale,
    height: target.height / scale,
    centerX: (target.left + target.width / 2 - rect.left) / scale,
    centerY: (target.top + target.height / 2 - rect.top) / scale,
  };
}
