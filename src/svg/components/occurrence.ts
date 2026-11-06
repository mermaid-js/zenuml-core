import type { OccurrenceGeometry } from "../geometry";
import { esc } from "./svgUtils";

export function renderOccurrence(o: OccurrenceGeometry): string {
  // SVG stroke is centered on the rect boundary. Inset it by half the 1px
  // stroke to keep its painted edge within HTML's 15px border box.
  const strokeHalf = 0.5;
  const rx = o.x + strokeHalf;
  return `<rect x="${rx}" y="${o.y + strokeHalf}" width="${o.width - strokeHalf * 2}" height="${o.height - strokeHalf * 2}" rx="1.5" class="occurrence" data-participant="${esc(o.participantName)}"/>`;
}
