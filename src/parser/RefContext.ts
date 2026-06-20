import { default as sequenceParser } from "../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const RefContext = seqParser.RefContext;

// ANTLR error recovery synthesizes a NameContext for invalid input like
// `ref()` so the `ref` rule can still match. A synthesized name has an
// inverted token interval (stop before start) and yields empty source text;
// it must not surface as content, an editable label, or an edit range.
function isSynthesizedName(name: any): boolean {
  if (!name || !name.start || !name.stop) return true;
  return name.stop.tokenIndex < name.start.tokenIndex;
}

// @ts-expect-error -- ANTLR generated code
RefContext.prototype.Content = function () {
  const first = this.name()[0];
  return isSynthesizedName(first) ? undefined : first;
};

// @ts-expect-error -- ANTLR generated code
RefContext.prototype.Participants = function () {
  return this.name().slice(1) ?? [];
};

// Inclusive [start, end] character range of a ref's first name (its label),
// or [-1, -1] when the name is missing/synthesized so the UI renders an empty,
// non-editable label instead of a misleading edit range.
export function labelRangeOfRef(ctx: any): [number, number] {
  const content = ctx?.Content?.();
  if (!content) return [-1, -1];
  return [content.start.start, content.stop.stop];
}
