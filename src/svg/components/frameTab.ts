import { FRAME_TAB_CUT } from "@/positioning/Constants";

/** The surrounding frame already draws the top and left rules. */
export function renderFrameTab(
  x: number,
  y: number,
  width: number,
  height: number,
  fillClass: string,
  ruleClass: string,
  radius: number,
): string {
  const right = x + width;
  const bottom = y + height;
  const cut = FRAME_TAB_CUT;
  const topLeft = radius
    ? `M ${x} ${y + radius} Q ${x} ${y} ${x + radius} ${y}`
    : `M ${x} ${y}`;
  const fill = `${topLeft} H ${right} V ${bottom - cut} L ${right - cut} ${bottom} H ${x} Z`;
  const ruleRight = right - 0.5;
  const ruleBottom = bottom - 0.5;
  const rule = `M ${ruleRight} ${y} V ${ruleBottom - cut} L ${ruleRight - cut} ${ruleBottom} H ${x}`;
  return `<path class="${fillClass}" d="${fill}"/><path class="${ruleClass}" d="${rule}"/>`;
}
