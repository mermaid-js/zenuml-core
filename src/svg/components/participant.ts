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
  // Actor icon inside a participant box (matching HTML renderer's actor.svg)
  const rx = 4;
  const boxX = p.x - p.width / 2;

  // The actor.svg viewBox is 0 0 24 24. Scale and center it inside the participant box.
  const iconSize = 28; // rendered size of the icon
  const iconX = p.x - iconSize / 2;
  const iconY = p.y + (p.height - iconSize) / 2;

  return `<g class="participant participant-starter" data-participant="${esc(p.name)}">
  <rect x="${boxX}" y="${p.y}" width="${p.width}" height="${p.height}" rx="${rx}" class="participant-box"/>
  <g transform="translate(${iconX}, ${iconY}) scale(${iconSize / 24})">
    <path d="M15.5489 4.19771C15.5489 5.18773 15.1485 6.13721 14.4358 6.83726C13.7231 7.53731 12.7565 7.93058 11.7486 7.93058C10.7407 7.93058 9.77403 7.53731 9.06133 6.83726C8.34863 6.13721 7.94824 5.18773 7.94824 4.19771C7.94824 3.20768 8.34863 2.25822 9.06133 1.55818C9.77403 0.858126 10.7407 0.464844 11.7486 0.464844C12.7565 0.464844 13.7231 0.858126 14.4358 1.55818C15.1485 2.25822 15.5489 3.20768 15.5489 4.19771Z" fill="none" stroke="#666" stroke-width="1"/>
    <path d="M6.54883 11.2152L17.2025 11.2073M11.7471 8.06641V19.5806V8.06641ZM11.7471 19.4385L6.79789 23.5738L11.7471 19.4385ZM11.7551 19.4385L17.1864 23.3055L11.7551 19.4385Z" fill="none" stroke="#666" stroke-width="1"/>
  </g>
</g>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
