import { marked } from "marked";
import { LayoutMetrics } from "./LayoutMetrics";
import { TextType, WidthFunc } from "@/positioning/Coordinate";

type GenericToken = ReturnType<typeof marked.lexer>[number];
type ListItemToken = GenericToken & {
  text?: string | string[];
  tokens?: GenericToken[];
  items?: ListItemToken[];
};

const STRIP_FORMATTING = /[*_`~]/g;

const sanitize = (value: string) => value.replace(STRIP_FORMATTING, "").trim();

const defaultTokensOptions = {
  gfm: true,
  breaks: true,
};

export class MarkdownMeasurer {
  constructor(
    private readonly metrics: LayoutMetrics,
    private readonly widthProvider: WidthFunc,
  ) {}

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

  private measureParagraph(text: string): number {
    const lines = text.split(/\n+/);
    return lines.reduce((acc, line) => {
      const sanitized = sanitize(line);
      if (!sanitized) {
        return acc + this.metrics.commentLineHeight;
      }
      const width = this.widthProvider(sanitized, TextType.MessageContent);
      const maxWidth = this.metrics.commentMaxWidth;
      const lineCount = Math.max(1, Math.ceil(width / maxWidth));
      return acc + lineCount * this.metrics.commentLineHeight;
    }, 0);
  }

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

  private measureBlockquote(tokens: GenericToken[]): number {
    if (!tokens.length) {
      return this.metrics.commentLineHeight;
    }
    const nestedHeight = this.measureNestedTokens(tokens);
    return nestedHeight + this.metrics.commentLineHeight; // border/padding approx
  }

  private measureCode(text: string): number {
    const lines = text.split(/\n/).length || 1;
    return (
      lines * this.metrics.commentCodeLineHeight + this.metrics.commentPaddingY
    );
  }
}
