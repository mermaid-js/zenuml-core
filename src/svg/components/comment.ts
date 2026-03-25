import { marked } from "marked";
import type { CommentGeometry } from "../geometry";
import { esc, styleToAttr } from "./svgUtils";

/**
 * Convert markdown text to SVG-safe content using the same parser (marked)
 * that the HTML renderer uses. This ensures code spans like `text` have
 * their backticks stripped, bold/italic get SVG-equivalent tspan styling,
 * and the rendered text content matches what HTML shows.
 */
function markdownToSvgContent(text: string): string {
  const tokens = marked.lexer(text, { gfm: true, breaks: true });
  return walkTokens(tokens);
}

function walkTokens(tokens: marked.TokensList | marked.Token[]): string {
  return tokens.map((t) => walkToken(t)).join("");
}

function walkToken(token: marked.Token): string {
  switch (token.type) {
    case "paragraph":
      return walkTokens(token.tokens || []);
    case "codespan":
      // marked strips backticks and gives us the inner text
      return esc(token.text);
    case "strong":
      return `<tspan font-weight="bold">${walkTokens(token.tokens || [])}</tspan>`;
    case "em":
      return `<tspan font-style="italic">${walkTokens(token.tokens || [])}</tspan>`;
    case "text":
      if ("tokens" in token && token.tokens) {
        return walkTokens(token.tokens);
      }
      return esc(token.raw);
    case "space":
      return "";
    default:
      return esc(token.raw || "");
  }
}

export function renderComment(c: CommentGeometry): string {
  const styleAttr = c.style ? ` style="${styleToAttr(c.style)}"` : "";
  return `<text x="${c.x}" y="${c.y}" class="comment-text"${styleAttr}>${markdownToSvgContent(c.text)}</text>`;
}

