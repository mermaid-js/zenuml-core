import type { LifelineGeometry } from "../geometry";

export function renderLifeline(l: LifelineGeometry): string {
  // Use x+0.5 to align 1px stroke to pixel grid (avoids anti-aliased 2px blur)
  const x = l.x + 0.5;
  return `<line x1="${x}" y1="${l.topY}" x2="${x}" y2="${l.bottomY}" class="lifeline" stroke-dasharray="${l.dashed ? "5,5" : "none"}" stroke-dashoffset="${l.dashed ? "5" : "0"}" shape-rendering="crispEdges"/>`;
}
