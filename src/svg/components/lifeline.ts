import type { LifelineGeometry } from "../geometry";

export function renderLifeline(l: LifelineGeometry): string {
  return `<line x1="${l.x}" y1="${l.topY}" x2="${l.x}" y2="${l.bottomY}" class="lifeline" stroke-dasharray="${l.dashed ? "5,5" : "none"}" stroke-dashoffset="${l.dashed ? "5" : "0"}"/>`;
}
