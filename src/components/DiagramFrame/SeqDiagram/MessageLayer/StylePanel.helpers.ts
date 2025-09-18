export const toggleStyleList = (styles: string[], style: string) =>
  styles.includes(style)
    ? styles.filter((existingStyle) => existingStyle !== style)
    : [...styles, style];

// OO internals to encapsulate string math and parsing
class CodeCursor {
  constructor(public readonly code: string, public readonly start: number) {}

  private lineStartFrom(index: number): number {
    const { code } = this;
    let i = index;
    if (i >= 0 && code[i] === "\n") i--;
    while (i >= 0) {
      if (code[i] === "\n") return i + 1;
      i--;
    }
    return 0;
  }

  get lineStart(): number {
    return this.lineStartFrom(this.start);
  }

  get prevLineStart(): number {
    const head = this.lineStartFrom(this.start);
    if (head === 0) return 0;
    return this.lineStartFrom(head - 1);
  }

  get leadingIndent(): string {
    const m = this.code.slice(this.lineStart).match(/^\s*/);
    return m?.[0] || "";
  }

  get prevLineTextNoEOL(): string {
    const { code } = this;
    const s = this.prevLineStart;
    const e = this.lineStart;
    let end = e;
    if (end > s && code[end - 1] === "\n") {
      end--;
      if (end > s && code[end - 1] === "\r") end--;
    }
    return code.slice(s, end);
  }
}

class CommentLine {
  constructor(
    public readonly exists: boolean,
    public readonly styles: string[],
    public readonly suffix: string,
  ) {}

  static parse(text: string): CommentLine {
    const m = text.match(/^\s*\/\/\s*(?:\[([^\]]*)\])?\s*(.*)$/);
    if (!m) return new CommentLine(false, [], "");
    const styles = (m[1] || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const suffix = (m[2] || "").trim();
    return new CommentLine(true, styles, suffix);
  }

  static format(leading: string, styles: string[], suffix: string): string {
    const list = styles.filter(Boolean).join(", ");
    const tail = suffix ? ` ${suffix}` : "";
    return `${leading}// [${list}]${tail}\n`;
  }
}

class StyleEditor {
  constructor(private readonly cursor: CodeCursor) {}

  read() {
    const c = CommentLine.parse(this.cursor.prevLineTextNoEOL);
    return c.styles;
  }

  apply(styles: string[]) {
    const c = CommentLine.parse(this.cursor.prevLineTextNoEOL);
    const insertHead = c.exists ? this.cursor.prevLineStart : this.cursor.lineStart;
    const commentLine = CommentLine.format(this.cursor.leadingIndent, styles, c.suffix);
    const { code } = this.cursor;
    return code.slice(0, insertHead) + commentLine + code.slice(this.cursor.lineStart);
  }
}

// Read existing styles at a message starting at startOffset.
export const readStylesAt = (
  code: string,
  messageStartPosition: number,
): string[] => new StyleEditor(new CodeCursor(code, messageStartPosition)).read();

// Apply a set of styles at the message starting at startOffset.
// Returns the updated code only; callers typically re-anchor on the next click.
export const applyStylesAt = (code: string, messageStartPosition: number, styles: string[]) =>
  new StyleEditor(new CodeCursor(code, messageStartPosition)).apply(styles);
