/** Markdown block extractor for `--md` mode. */

export interface ZenumlBlock {
  /** Zero-based index of this block among all zenuml blocks in the document */
  index: number;
  /** The ZenUML DSL code inside the fence (may be empty string for empty blocks) */
  code: string;
  /** Title extracted from the info string after "zenuml" (trimmed), or empty string */
  title: string;
  /** The full raw fence text including the opening and closing ``` lines */
  raw: string;
  /** True if the code (trimmed) is empty — these blocks should be excluded from rendering */
  empty: boolean;
}

/**
 * Extract all ```zenuml ... ``` fenced code blocks from Markdown text.
 * Returns one ZenumlBlock per block, in document order.
 */
export function extractZenumlBlocks(md: string): ZenumlBlock[] {
  const results: ZenumlBlock[] = [];
  // Match fenced code blocks that start with ```zenuml (with optional title after)
  // Handles both ``` and ~~~ fences but we only care about backtick fences for ZenUML
  const fencePattern = /^(`{3,})zenuml([^\n]*)\n([\s\S]*?)\n?\1\s*$/gm;
  let match: RegExpExecArray | null;
  let blockIndex = 0;
  while ((match = fencePattern.exec(md)) !== null) {
    const raw = match[0];
    const infoExtra = match[2]; // everything after "zenuml" on the opening line
    const code = match[3]; // content between fences
    const title = infoExtra.trim();
    const empty = code.trim().length === 0;
    results.push({ index: blockIndex++, code, title, raw, empty });
  }
  return results;
}
