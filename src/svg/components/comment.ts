import type { CommentGeometry } from "../geometry";

export function renderComment(c: CommentGeometry): string {
  return `<text x="${c.x}" y="${c.y}" class="comment-text">${esc(c.text)}</text>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
