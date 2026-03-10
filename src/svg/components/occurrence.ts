import type { OccurrenceGeometry } from "../geometry";

export function renderOccurrence(o: OccurrenceGeometry): string {
  return `<rect x="${o.x}" y="${o.y}" width="${o.width}" height="${o.height}" class="occurrence" data-participant="${esc(o.participantName)}"/>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
