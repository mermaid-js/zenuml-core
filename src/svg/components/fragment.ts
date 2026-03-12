import type { FragmentGeometry } from "../geometry";

const HEADER_HEIGHT = 25;
const HEADER_TAB_EXTRA = 10; // pentagon tab extends beyond text

export function renderFragment(f: FragmentGeometry): string {
  const parts: string[] = [];

  // Fragment border rect
  parts.push(
    `<rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" rx="4" class="fragment-border"/>`,
  );

  // Header tab (pentagon shape) with fragment kind label
  const kindLabel = getKindLabel(f.kind);
  const headerWidth = Math.min(kindLabel.length * 8 + 16 + HEADER_TAB_EXTRA, f.width);

  // Pentagon path: starts at top-left, goes right across top, down, diagonal cut, left, up
  const hx = f.x;
  const hy = f.y;
  const tabPath = `M ${hx} ${hy} L ${hx + headerWidth} ${hy} L ${hx + headerWidth} ${hy + HEADER_HEIGHT - 6} L ${hx + headerWidth - 6} ${hy + HEADER_HEIGHT} L ${hx} ${hy + HEADER_HEIGHT} Z`;
  parts.push(`<path d="${tabPath}" class="fragment-header"/>`);
  parts.push(
    `<text x="${hx + 6}" y="${hy + HEADER_HEIGHT / 2 + 1}" dominant-baseline="central" class="fragment-label">${esc(kindLabel)}</text>`,
  );

  // Condition label (to the right of the header tab)
  if (f.label) {
    const conditionX = hx + headerWidth + 6;
    parts.push(
      `<text x="${conditionX}" y="${hy + HEADER_HEIGHT / 2 + 1}" dominant-baseline="central" class="fragment-condition">[${esc(f.label)}]</text>`,
    );
  }

  // Section separator lines and labels (for multi-section fragments like alt, tcf)
  if (f.sections.length > 1) {
    for (let i = 1; i < f.sections.length; i++) {
      const section = f.sections[i];
      const lineY = section.y;
      // Dashed separator line
      parts.push(
        `<line x1="${f.x}" y1="${lineY}" x2="${f.x + f.width}" y2="${lineY}" class="fragment-separator"/>`,
      );
      // Section label
      if (section.label) {
        parts.push(
          `<text x="${f.x + 8}" y="${lineY + 16}" class="fragment-section-label">${esc(section.label)}</text>`,
        );
      }
    }
  }

  return `<g class="fragment fragment-${f.kind}">\n  ${parts.join("\n  ")}\n</g>`;
}

function getKindLabel(kind: string): string {
  switch (kind) {
    case "alt": return "alt";
    case "loop": return "loop";
    case "opt": return "opt";
    case "par": return "par";
    case "critical": return "critical";
    case "section": return "section";
    case "tcf": return "try";
    case "ref": return "ref";
    default: return kind;
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
