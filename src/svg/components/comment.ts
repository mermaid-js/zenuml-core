import type { CommentGeometry } from "../geometry";
import { escXml as esc, styleToAttr } from "../svg-utils";

export function renderComment(c: CommentGeometry): string {
  const styleAttr = c.style ? ` style="${styleToAttr(c.style)}"` : "";
  return `<text x="${c.x}" y="${c.y}" class="comment-text"${styleAttr}>${esc(c.text)}</text>`;
}

