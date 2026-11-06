import { marked } from "marked";

/**
 * The one marked configuration for comment markdown. The HTML renderer, the
 * SVG renderer and the layout measurer all lex through this, so a change here
 * applies to all three.
 */
export const COMMENT_MARKDOWN_OPTIONS = { gfm: true, breaks: true };

export function lexComment(text: string): marked.TokensList {
  return marked.lexer(text, COMMENT_MARKDOWN_OPTIONS);
}
