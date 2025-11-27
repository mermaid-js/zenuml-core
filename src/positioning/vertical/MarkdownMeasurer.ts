import { marked } from "marked";
import { LayoutMetrics } from "./LayoutMetrics";

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

/**
 * Lightweight renderer that approximates how markdown comments expand vertically
 * within the diagram. We only need pixel-perfect heights, so the logic tokenizes
 * the markdown via `marked` and sums up the equivalent line heights using the
 * same font metrics the browser would use.
 */
export class MarkdownMeasurer {
  constructor(private readonly metrics: LayoutMetrics) {}

  measure(text: string | undefined | null): number {
    if (!text || !text.trim()) {
      return 0;
    }
    const tokens = marked.lexer(text, defaultTokensOptions);
    if (!tokens.length) {
      return 0;
    }
    let total = this.metrics.commentPaddingY * 2;
    tokens.forEach((token, index) => {
      total += this.measureToken(token);
      if (index < tokens.length - 1) {
        total += this.metrics.commentBlockSpacing;
      }
    });
    return total;
  }

  private measureToken(token: GenericToken): number {
    switch (token.type) {
      case "heading":
        return this.metrics.commentLineHeight * (token.depth || 1);
      case "paragraph":
        return this.measureParagraph(token.text);
      case "list":
        return this.measureList((token as ListItemToken).items || []);
      case "code":
        return this.measureCode(token.text || "");
      case "blockquote":
        return this.measureBlockquote((token as ListItemToken).tokens || []);
      case "space":
        return this.metrics.commentLineHeight * 0.5;
      default:
        return this.metrics.commentLineHeight;
    }
  }

  /** Splits the paragraph into lines; wrapping is ignored for server-side determinism. */
  private measureParagraph(text: string): number {
    const lines = text.split(/\n+/);
    return lines.reduce((acc) => acc + this.metrics.commentLineHeight, 0);
  }

  /** Recursively measures bullet/numbered lists. */
  private measureList(items: ListItemToken[]): number {
    if (!items.length) {
      return this.metrics.commentLineHeight;
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
      return this.metrics.commentLineHeight;
    }
    const nestedHeight = this.measureNestedTokens(tokens);
    return nestedHeight + this.metrics.commentLineHeight; // border/padding approx
  }

  /** Monospace blocks use a different line height plus padding. */
  private measureCode(text: string): number {
    const lines = text.split(/\n/).length || 1;
    return (
      lines * this.metrics.commentCodeLineHeight + this.metrics.commentPaddingY
    );
  }
}
