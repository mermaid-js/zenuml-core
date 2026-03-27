import { marked } from "marked";
import type { CommentGeometry } from "../geometry";
import { esc, styleToAttr } from "./svgUtils";

/**
 * Convert markdown text to SVG-safe content using the same parser (marked)
 * that the HTML renderer uses. This ensures code spans like `text` have
 * their backticks stripped, bold/italic get SVG-equivalent tspan styling,
 * and the rendered text content matches what HTML shows.
 */
function markdownToSvgLines(text: string): string[] {
  const tokens = marked.lexer(text, { gfm: true, breaks: true });
  return collectLines(tokens);
}

function collectLines(tokens: marked.TokensList | marked.Token[]): string[] {
  const lines: string[][] = [[]];

  const pushFragment = (fragment: string) => {
    if (fragment) {
      lines[lines.length - 1].push(fragment);
    }
  };

  const pushLineBreak = () => {
    lines.push([]);
  };

  const walkTokens = (tokenList: marked.TokensList | marked.Token[]) => {
    tokenList.forEach((token, index) => {
      walkToken(token);

      if (
        index < tokenList.length - 1 &&
        (token.type === "paragraph" || token.type === "code")
      ) {
        pushLineBreak();
      }
    });
  };

  const walkToken = (token: marked.Token): void => {
    switch (token.type) {
      case "paragraph":
        walkTokens(token.tokens || []);
        return;
      case "code": {
        const codeLines = token.text.split("\n");
        codeLines.forEach((line, index) => {
          if (index > 0) {
            pushLineBreak();
          }
          pushFragment(`<tspan font-family="monospace">${esc(line)}</tspan>`);
        });
        return;
      }
      case "codespan":
        pushFragment(esc(token.text));
        return;
      case "strong":
        pushFragment(`<tspan font-weight="bold">${collectLines(token.tokens || []).join("")}</tspan>`);
        return;
      case "em":
        pushFragment(`<tspan font-style="italic">${collectLines(token.tokens || []).join("")}</tspan>`);
        return;
      case "text":
        if ("tokens" in token && token.tokens) {
          walkTokens(token.tokens);
          return;
        }
        pushFragment(esc(token.raw));
        return;
      case "br":
        pushLineBreak();
        return;
      case "space":
        return;
      default:
        pushFragment(esc(token.raw || ""));
    }
  };

  walkTokens(tokens);

  return lines.map((line) => line.join(""));
}

export function renderComment(c: CommentGeometry): string {
  const styleAttr = c.style ? ` style="${styleToAttr(c.style)}"` : "";
  const lines = markdownToSvgLines(c.text);
  const tspans = lines
    .map((line, index) =>
      index === 0
        ? `<tspan x="${c.x}" y="${c.y}">${line || " "}</tspan>`
        : `<tspan x="${c.x}" dy="20">${line || " "}</tspan>`,
    )
    .join("");
  return `<text class="comment-text"${styleAttr}>${tspans}</text>`;
}
