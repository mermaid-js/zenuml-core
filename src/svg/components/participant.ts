import type { ParticipantGeometry } from "../geometry";

export function renderParticipant(p: ParticipantGeometry): string {
  if (p.isStarter) return renderStarterParticipant(p);

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
  if (!p.showBottom || p.isStarter) return "";
  const rx = 4;
  const x = p.x - p.width / 2;
  const textX = p.x;
  const textY = bottomY + p.height / 2;

  return `<g class="participant participant-bottom" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${bottomY}" width="${p.width}" height="${p.height}" rx="${rx}" class="participant-box"/>
  <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="central" class="participant-label">${esc(p.label)}</text>
</g>`;
}

function renderStarterParticipant(p: ParticipantGeometry): string {
  // Actor icon inside a participant box (matching HTML renderer)
  const rx = 4;
  const boxX = p.x - p.width / 2;

  // Stick figure centered inside the box
  const cx = p.x;
  const iconH = 24; // total icon height
  const iconTop = p.y + (p.height - iconH) / 2; // vertically centered in box
  const headR = 4;
  const headCY = iconTop + headR;
  const bodyTop = iconTop + headR * 2;
  const bodyBottom = bodyTop + 8;
  const legBottom = bodyBottom + 8;
  const armY = bodyTop + 4;
  const armSpan = 7;

  return `<g class="participant participant-starter" data-participant="${esc(p.name)}">
  <rect x="${boxX}" y="${p.y}" width="${p.width}" height="${p.height}" rx="${rx}" class="participant-box"/>
  <circle cx="${cx}" cy="${headCY}" r="${headR}" fill="none" stroke="#666" stroke-width="1.5"/>
  <line x1="${cx}" y1="${bodyTop}" x2="${cx}" y2="${bodyBottom}" stroke="#666" stroke-width="1.5"/>
  <line x1="${cx - armSpan}" y1="${armY}" x2="${cx + armSpan}" y2="${armY}" stroke="#666" stroke-width="1.5"/>
  <line x1="${cx}" y1="${bodyBottom}" x2="${cx - 6}" y2="${legBottom}" stroke="#666" stroke-width="1.5"/>
  <line x1="${cx}" y1="${bodyBottom}" x2="${cx + 6}" y2="${legBottom}" stroke="#666" stroke-width="1.5"/>
</g>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
