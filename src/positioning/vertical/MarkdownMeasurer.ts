import { marked } from "marked";
import DOMPurify from "dompurify";
import Comment from "../../components/Comment/Comment";

type GenericToken = ReturnType<typeof marked.lexer>[number];
type ListItemToken = GenericToken & {
  text?: string | string[];
  tokens?: GenericToken[];
  items?: ListItemToken[];
};

const defaultTokensOptions = {
  gfm: true,
  breaks: true,
};

const rem = (value: number) => value * 16;
const tw = (value: number) => value * 4;
const commentLineHeight = rem(1.25);
const commentCodeLineHeight = rem(1.1);
const commentBlockSpacing = tw(2);

/**
 * Lightweight renderer that approximates how markdown comments expand vertically
 * within the diagram. We only need pixel-perfect heights, so the logic tokenizes
 * the markdown via `marked` and sums up the equivalent line heights using the
 * same font metrics the browser would use.
 */
export class MarkdownMeasurer {
  measure(_text: string | undefined | null): number {
    if (!_text || !_text.trim()) {
      return 0;
    }

    const commentObj = new Comment(_text);
    const text = DOMPurify.sanitize(
      commentObj?.text && marked.parse(commentObj?.text),
    );

    // console.info(
    //   "MarkdownMeasurer",
    //   `comment ${_text}`,
    //   `commentObj?.text ${commentObj?.text}`,
    //   `markedComment ${text}`,
    // );

    const tokens = marked.lexer(text, defaultTokensOptions);
    if (!tokens.length) {
      return 0;
    }
    let total = 0;
    tokens.forEach((token, index) => {
      total += this.measureToken(token);
      if (index < tokens.length - 1) {
        total += commentBlockSpacing;
      }
    });
    return total;
  }

  private measureToken(token: GenericToken): number {
    switch (token.type) {
      case "heading":
        return commentLineHeight * (token.depth || 1);
      case "paragraph":
        return this.measureParagraph(token.text);
      case "list":
        return this.measureList((token as ListItemToken).items || []);
      case "code":
        return this.measureCode(token.text || "");
      case "blockquote":
        return this.measureBlockquote((token as ListItemToken).tokens || []);
      case "space":
        return commentLineHeight * 0.5;
      default:
        return commentLineHeight;
    }
  }

  /** Splits the paragraph into lines; wrapping is ignored for server-side determinism. */
  private measureParagraph(text: string): number {
    const lines = text.split(/\n+/);
    return lines.reduce((acc) => acc + commentLineHeight, 0);
  }

  /** Recursively measures bullet/numbered lists. */
  private measureList(items: ListItemToken[]): number {
    if (!items.length) {
      return commentLineHeight;
    }
    return items.reduce((acc, item) => {
      const text = Array.isArray(item.text)
        ? item.text.join(" ")
        : item.text || "";
      const height =
        this.measureParagraph(text) +
        (item.tokens ? this.measureNestedTokens(item.tokens) : 0);
      return acc + height;
    }, 0);
  }

  private measureNestedTokens(tokens: GenericToken[]): number {
    return tokens.reduce((acc, token) => acc + this.measureToken(token), 0);
  }

  /** Blockquotes introduce an extra line for the decorative border. */
  private measureBlockquote(tokens: GenericToken[]): number {
    if (!tokens.length) {
      return commentLineHeight;
    }
    const nestedHeight = this.measureNestedTokens(tokens);
    return nestedHeight + commentLineHeight; // border/padding approx
  }

  /** Monospace blocks use a different line height plus padding. */
  private measureCode(text: string): number {
    const lines = text.split(/\n/).length || 1;
    return lines * commentCodeLineHeight;
  }
}
