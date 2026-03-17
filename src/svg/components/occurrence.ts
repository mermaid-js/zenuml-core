import type { OccurrenceGeometry } from "../geometry";

export function renderOccurrence(o: OccurrenceGeometry): string {
  // SVG stroke is centered on the rect boundary (1px inside, 1px outside).
  // HTML uses border-box with border-2 (fully inside the 15px element).
  // Inset rect by 1px so the stroke stays within the same visual footprint.
  const strokeHalf = 1; // half of stroke-width: 2
  const rx = o.x + strokeHalf;
  return `<rect x="${rx}" y="${o.y + strokeHalf}" width="${o.width - strokeHalf * 2}" height="${o.height - strokeHalf * 2}" rx="1" class="occurrence" data-participant="${esc(o.participantName)}"/>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
