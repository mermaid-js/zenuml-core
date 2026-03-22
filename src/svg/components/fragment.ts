import type { FragmentGeometry } from "../geometry";

const HEADER_HEIGHT = 25;
const BRACKET_WIDTH = 3.89;
const TEXT_PAD_X = 4;

/**
 * Stroke inset for SVG border-box emulation.
 * CSS border-box keeps the border INSIDE the element's width/height.
 * SVG centered stroke extends half the stroke width OUTSIDE the rect.
 * Inset the rect by half the stroke width on each side so the outer
 * stroke edge aligns with the CSS border outer edge.
 */
const STROKE_WIDTH = 1;
const HALF_STROKE = STROKE_WIDTH / 2; // 0.5px inset

export function renderFragment(f: FragmentGeometry): string {
  const parts: string[] = [];

  // Fragment border rect — inset by half stroke width so outer stroke
  // edge matches CSS border-box model (border inside the bounding box)
  parts.push(
    `<rect x="${f.x + HALF_STROKE}" y="${f.y + HALF_STROKE}" width="${f.width - STROKE_WIDTH}" height="${f.height - STROKE_WIDTH}" rx="4" class="fragment-border"/>`,
  );

  // Full-width header bar (matches HTML's bg-skin-fragment-header)
  // 1px inside the border on all sides, offset by any comment height
  const headerX = f.x + 1;
  const headerY = f.headerY;
  const headerW = f.width - 2;
  parts.push(
    `<rect x="${headerX}" y="${headerY}" width="${headerW}" height="${HEADER_HEIGHT}" class="fragment-header"/>`,
  );

  // Kind-specific icon inside the header bar
  // Each fragment type uses its own icon matching the HTML/React renderer
  const iconX = headerX + 4;
  const iconY = headerY;
  parts.push(getFragmentIcon(f.kind, iconX, iconY));

  const kindLabel = getKindLabel(f.kind);
  const labelX = headerX + 26; // after the diamond icon
  parts.push(
    `<text x="${labelX}" y="${headerY + HEADER_HEIGHT / 2 - 0.5}" dominant-baseline="central" class="fragment-label">${esc(kindLabel)}</text>`,
  );

  // Sequence number: positioned to the left of the fragment with 4px gap (matching HTML pr-1)
  if (f.number) {
    parts.push(
      `<text x="${f.x - 3}" y="${headerY + HEADER_HEIGHT / 2 - 4.5}" text-anchor="end" dominant-baseline="central" class="seq-number">${esc(f.number)}</text>`,
    );
  }

  // Condition label below the header (matches HTML's text-skin-fragment div)
  // HTML: .text-skin-fragment div top = headerBottom, span.condition top = headerBottom + 2 (padding)
  // SVG dominant-baseline="hanging" puts text top ~2.6px above y → need y = htmlTextTop + 2.6
  if (f.label) {
    const condY = headerY + HEADER_HEIGHT + 15;
    parts.push(renderBracketedLabel(headerX, condY, f.label, f.labelWidth, "fragment-condition"));
  }

  // Section separator lines and labels (for multi-section fragments like alt, tcf)
  if (f.sections.length > 1) {
    for (let i = 1; i < f.sections.length; i++) {
      const section = f.sections[i];
      const lineY = section.y;
      const separatorY = lineY + HALF_STROKE;
      // Dashed separator line
      parts.push(
        `<line x1="${f.x + 1}" y1="${separatorY}" x2="${f.x + f.width - 1}" y2="${separatorY}" class="fragment-separator"/>`,
      );
      // Section label — split into keyword + condition (e.g. "catch" + "error") as separate elements
      // Both catch and finally have a semi-transparent white background (bg-skin-frame opacity-65)
      if (section.label) {
        const labelY = lineY + 16;
        const isFinally = section.label.startsWith("finally");
        const isBracketed = !!section.innerLabel && section.label !== "[else]";
        if (isBracketed) {
          const labelX = f.x + 1;
          parts.push(
            renderBracketedLabel(labelX, labelY, section.innerLabel!, section.innerLabelWidth, "fragment-section-label"),
          );
          continue;
        }
        // Split "catch error" → ["catch", "error"], "else [cond]" → ["else", "[cond]"], "finally" → ["finally"]
        const spaceIdx = section.label.indexOf(" ");
        if (spaceIdx > 0 && !isFinally) {
          const keyword = section.keyword || section.label.substring(0, spaceIdx);
          const condition = section.detail || section.label.substring(spaceIdx + 1);
          const keywordWidth = section.keywordWidth ?? keyword.length * 7;
          const keywordX = f.x + 5;
          const conditionX = keywordX + keywordWidth + TEXT_PAD_X * 2;
          // Group with opacity 0.65 matches HTML parent opacity (affects both bg and text together)
          const bgWidth = (section.keywordWidth ?? keyword.length * 7) + (section.detailWidth ?? condition.length * 7) + TEXT_PAD_X * 4;
          parts.push(
            `<g opacity="0.65">` +
            `<rect x="${keywordX - TEXT_PAD_X}" y="${lineY + 1}" width="${bgWidth}" height="20" fill="#fff"/>` +
            `<text x="${keywordX}" y="${labelY}" class="fragment-section-label" fill="#222">${esc(keyword)}</text>` +
            `<text x="${conditionX}" y="${labelY}" class="fragment-section-label" fill="#222">${esc(condition)}</text>` +
            `</g>`,
          );
        } else {
          const finallyX = f.x + 5;
          const finallyY = labelY;
          const bgWidth = (section.labelWidth ?? section.label.length * 7) + TEXT_PAD_X * 2;
          const bgY = section.label === "[else]" ? lineY - 1 : lineY + 1;
          const bgHeight = section.label === "[else]" ? 24 : 20;
          parts.push(
            `<g opacity="0.65">` +
            `<rect x="${finallyX - TEXT_PAD_X}" y="${bgY}" width="${bgWidth}" height="${bgHeight}" fill="#fff"/>` +
            `<text x="${finallyX}" y="${finallyY}" class="fragment-section-label">${esc(section.label)}</text>` +
            `</g>`,
          );
        }
      }
    }
  }

  return `<g class="fragment fragment-${f.kind}">\n  ${parts.join("\n  ")}\n</g>`;
}

function renderBracketedLabel(x: number, y: number, innerText: string, innerWidth?: number, cls: string = "fragment-condition"): string {
  const measuredInnerWidth = innerWidth ?? innerText.length * 7;
  const innerX = x + BRACKET_WIDTH + TEXT_PAD_X;
  const closeX = innerX + measuredInnerWidth + TEXT_PAD_X;
  return (
    `<g>` +
    `<text x="${x}" y="${y}" class="${cls}">[</text>` +
    `<text x="${innerX}" y="${y}" class="${cls}" opacity="0.65">${esc(innerText)}</text>` +
    `<text x="${closeX}" y="${y}" class="${cls}">]</text>` +
    `</g>`
  );
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

function getFragmentIcon(kind: string, x: number, y: number): string {
  // Icons match src/components/Icon/icons/*-fragment.svg from the HTML renderer
  const w = 20;
  const h = 24;
  switch (kind) {
    case "loop":
      return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 1024 1024" fill="#000" stroke="none">
      <path d="M960 101.84l-896.002.002c-35.344 0-64 28.656-64 64v576c0 35.36 28.656 64 64 64h160c20.496 0 32-26.32 32-31.984v-.016c0-5.824-10.88-32.416-32-32.416h-120.96c-21.376 0-38.72-17.344-38.72-38.72V206.002c0-21.391 17.328-38.72 38.72-38.72l818.272-1.007c21.376 0 38.72 17.328 38.72 38.72V702.69c0 21.376-17.344 38.72-38.72 38.72H518.142l75.984-68.912c9.344-8.944 12.369-23.408 3.025-32.336l-5.472-8.064c-9.376-8.945-24.496-8.945-33.84 0L428.111 750.53c-.192.16-.368.224-.528.368l-8.48 8.096c-4.672 4.431-7.008 10.335-6.976 16.223-.032 5.904 2.288 11.777 6.977 16.288l8.48 8.096c.16.16.368.192.528.336L555.84 915.44c9.344 8.944 24.464 8.944 33.84 0l5.472-8.065c9.344-8.944 6.32-23.44-3.025-32.368l-77.135-69.168H960c35.343 0 64-28.64 64-64v-576c0-35.344-28.657-64-64-64z"/>
    </svg>`;
    case "opt":
      return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="7" stroke="#000" stroke-width="1.5" stroke-dasharray="3 2" stroke-linecap="round"/>
    </svg>`;
    case "par":
      return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 24 24" fill="none">
      <path d="M5 10H19" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 14H19" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    case "critical":
      return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 24 24" fill="none">
      <path d="M12 5L19 12L12 19L5 12L12 5Z" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 9V13" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 15V15.5" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    case "tcf":
      return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 76 76" fill="#000" stroke="none">
      <path d="M 26,22.0001L 27,21.9998L 27,27L 26.0001,27.0003C 23.2386,27.0003 21.0001,29.2389 21.0001,32.0003L 21,46.0002C 21,48.7616 23.2386,51.0002 25.9999,51.0002L 27,51.0002L 27,47L 33.75,53.5L 27,60L 27,56L 26,56C 20.4771,56 16,51.5229 16,46L 16,32.0001C 16,26.4773 20.4771,22.0001 26,22.0001 Z M 33,27L 59,27L 59,32L 33,32L 33,27 Z M 36,35L 59,35L 59,40L 36,40L 36,35 Z M 33,43L 59,43L 59,48L 33,48L 33,43 Z"/>
    </svg>`;
    case "ref":
      return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 24 24" fill="none">
      <path d="M10 6H18C19.1046 6 20 6.89543 20 8V16C20 17.1046 19.1046 18 18 18H10" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 6L6 12L10 18" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    case "section":
      return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 15 15" fill="#000" stroke="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M2 1.5C2 1.77614 1.77614 2 1.5 2C1.22386 2 1 1.77614 1 1.5C1 1.22386 1.22386 1 1.5 1C1.77614 1 2 1.22386 2 1.5ZM2 5L2 10H13V5H2ZM2 4C1.44772 4 1 4.44772 1 5V10C1 10.5523 1.44772 11 2 11H13C13.5523 11 14 10.5523 14 10V5C14 4.44772 13.5523 4 13 4H2ZM1.5 14C1.77614 14 2 13.7761 2 13.5C2 13.2239 1.77614 13 1.5 13C1.22386 13 1 13.2239 1 13.5C1 13.7761 1.22386 14 1.5 14ZM4 1.5C4 1.77614 3.77614 2 3.5 2C3.22386 2 3 1.77614 3 1.5C3 1.22386 3.22386 1 3.5 1C3.77614 1 4 1.22386 4 1.5ZM3.5 14C3.77614 14 4 13.7761 4 13.5C4 13.2239 3.77614 13 3.5 13C3.22386 13 3 13.2239 3 13.5C3 13.7761 3.22386 14 3.5 14ZM6 1.5C6 1.77614 5.77614 2 5.5 2C5.22386 2 5 1.77614 5 1.5C5 1.22386 5.22386 1 5.5 1C5.77614 1 6 1.22386 6 1.5ZM5.5 14C5.77614 14 6 13.7761 6 13.5C6 13.2239 5.77614 13 5.5 13C5.22386 13 5 13.2239 5 13.5C5 13.7761 5.22386 14 5.5 14ZM8 1.5C8 1.77614 7.77614 2 7.5 2C7.22386 2 7 1.77614 7 1.5C7 1.22386 7.22386 1 7.5 1C7.77614 1 8 1.22386 8 1.5ZM7.5 14C7.77614 14 8 13.7761 8 13.5C8 13.2239 7.77614 13 7.5 13C7.22386 13 7 13.2239 7 13.5C7 13.7761 7.22386 14 7.5 14ZM10 1.5C10 1.77614 9.77614 2 9.5 2C9.22386 2 9 1.77614 9 1.5C9 1.22386 9.22386 1 9.5 1C9.77614 1 10 1.22386 10 1.5ZM9.5 14C9.77614 14 10 13.7761 10 13.5C10 13.2239 9.77614 13 9.5 13C9.22386 13 9 13.2239 9 13.5C9 13.7761 9.22386 14 9.5 14ZM12 1.5C12 1.77614 11.7761 2 11.5 2C11.2239 2 11 1.77614 11 1.5C11 1.22386 11.2239 1 11.5 1C11.7761 1 12 1.22386 12 1.5ZM11.5 14C11.7761 14 12 13.7761 12 13.5C12 13.2239 11.7761 13 11.5 13C11.2239 13 11 13.2239 11 13.5C11 13.7761 11.2239 14 11.5 14ZM14 1.5C14 1.77614 13.7761 2 13.5 2C13.2239 2 13 1.77614 13 1.5C13 1.22386 13.2239 1 13.5 1C13.7761 1 14 1.22386 14 1.5ZM13.5 14C13.7761 14 14 13.7761 14 13.5C14 13.2239 13.7761 13 13.5 13C13.2239 13 13 13.2239 13 13.5C13 13.7761 13.2239 14 13.5 14Z"/>
    </svg>`;
    case "alt":
    default:
      // Diamond icon (alt-fragment.svg) — default for alt and unknown types
      return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 24 24" fill="none">
      <path d="M12 8L20 12L12 16L4 12L12 8Z" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
