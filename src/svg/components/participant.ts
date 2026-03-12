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
  // Stick figure "actor" icon scaled to fit within PARTICIPANT_VISUAL_HEIGHT (40px)
  const cx = p.x;
  const headR = 6;
  const headCY = p.y + headR; // head top at p.y, center at p.y+6
  const bodyTop = p.y + headR * 2; // 12
  const bodyBottom = bodyTop + 12; // 24
  const legBottom = bodyBottom + 12; // 36 — fits within 40px
  const armY = bodyTop + 5;
  const armSpan = 10;

  return `<g class="participant participant-starter" data-participant="${esc(p.name)}">
  <circle cx="${cx}" cy="${headCY}" r="${headR}" fill="none" stroke="#666" stroke-width="2"/>
  <line x1="${cx}" y1="${bodyTop}" x2="${cx}" y2="${bodyBottom}" stroke="#666" stroke-width="2"/>
  <line x1="${cx - armSpan}" y1="${armY}" x2="${cx + armSpan}" y2="${armY}" stroke="#666" stroke-width="2"/>
  <line x1="${cx}" y1="${bodyBottom}" x2="${cx - 8}" y2="${legBottom}" stroke="#666" stroke-width="2"/>
  <line x1="${cx}" y1="${bodyBottom}" x2="${cx + 8}" y2="${legBottom}" stroke="#666" stroke-width="2"/>
</g>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
