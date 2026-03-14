import type { CommentGeometry } from "../geometry";

export function renderComment(c: CommentGeometry): string {
  const styleAttr = c.style ? ` style="${styleToAttr(c.style)}"` : "";
  return `<text x="${c.x}" y="${c.y}" class="comment-text"${styleAttr}>${esc(c.text)}</text>`;
}

function styleToAttr(style: Record<string, string>): string {
  return Object.entries(style)
    .map(([k, v]) => `${esc(k)}: ${esc(v)}`)
    .join("; ");
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
