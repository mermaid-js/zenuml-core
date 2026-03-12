import type { ParticipantGeometry } from "../geometry";

export function renderParticipant(p: ParticipantGeometry): string {
  const rx = 4;
  const x = p.x - p.width / 2;
  const textX = p.x;
  const textY = p.y + p.height / 2;

  return `<g class="participant" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${p.y}" width="${p.width}" height="${p.height}" rx="${rx}" class="participant-box"/>
  <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="central" class="participant-label">${esc(p.label)}</text>
</g>`;
}

export function renderParticipantBottom(p: ParticipantGeometry, bottomY: number): string {
  if (!p.showBottom) return "";
  const rx = 4;
  const x = p.x - p.width / 2;
  const textX = p.x;
  const textY = bottomY + p.height / 2;

  return `<g class="participant participant-bottom" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${bottomY}" width="${p.width}" height="${p.height}" rx="${rx}" class="participant-box"/>
  <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="central" class="participant-label">${esc(p.label)}</text>
</g>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
