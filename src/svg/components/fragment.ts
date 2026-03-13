import type { FragmentGeometry } from "../geometry";

const HEADER_HEIGHT = 25;

export function renderFragment(f: FragmentGeometry): string {
  const parts: string[] = [];

  // Fragment border rect
  parts.push(
    `<rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" rx="4" class="fragment-border"/>`,
  );

  // Full-width header bar (matches HTML's bg-skin-fragment-header)
  // 1px inside the border on all sides
  const headerX = f.x + 1;
  const headerY = f.y + 1;
  const headerW = f.width - 2;
  parts.push(
    `<rect x="${headerX}" y="${headerY}" width="${headerW}" height="${HEADER_HEIGHT}" class="fragment-header"/>`,
  );

  // Kind label inside the header bar (e.g. "Alt", "Loop")
  // Reuse the exact same SVG icon from HTML (alt-fragment.svg):
  // <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  //   <path d="M12 8L20 12L12 16L4 12L12 8Z" stroke="currentColor" stroke-width="1.5" .../>
  // </svg>
  // HTML renders at 20x24px, positioned 4px from header left, 0px from header top
  // stroke="currentColor" resolves to #000 in the HTML context
  const iconX = headerX + 4;
  const iconY = headerY;
  parts.push(
    `<svg x="${iconX}" y="${iconY}" width="20" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 8L20 12L12 16L4 12L12 8Z" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  );

  const kindLabel = getKindLabel(f.kind);
  const labelX = headerX + 26; // after the diamond icon
  parts.push(
    `<text x="${labelX}" y="${headerY + HEADER_HEIGHT / 2 - 0.5}" dominant-baseline="central" class="fragment-label">${esc(kindLabel)}</text>`,
  );

  // Sequence number: positioned to the left of the fragment with 4px gap (matching HTML pr-1)
  if (f.number) {
    parts.push(
      `<text x="${f.x - 4}" y="${headerY + HEADER_HEIGHT / 2 - 0.5}" text-anchor="end" dominant-baseline="central" class="seq-number">${esc(f.number)}</text>`,
    );
  }

  // Condition label below the header (matches HTML's text-skin-fragment div)
  // HTML: .text-skin-fragment div top = headerBottom, span.condition top = headerBottom + 2 (padding)
  // SVG dominant-baseline="hanging" puts text top ~2.6px above y → need y = htmlTextTop + 2.6
  if (f.label) {
    const condY = headerY + HEADER_HEIGHT + 5;
    parts.push(
      `<text x="${headerX}" y="${condY}" dominant-baseline="hanging" class="fragment-condition">[${esc(f.label)}]</text>`,
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
    case "alt": return "Alt";
    case "loop": return "Loop";
    case "opt": return "Opt";
    case "par": return "Par";
    case "critical": return "Critical";
    case "section": return "Section";
    case "tcf": return "Try";
    case "ref": return "Ref";
    default: return kind.charAt(0).toUpperCase() + kind.slice(1);
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
