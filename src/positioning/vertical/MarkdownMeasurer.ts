import { lexComment } from "@/parser/commentMarkdown";
import Comment from "../../components/Comment/Comment";
import { COMMENT_LINE_HEIGHT } from "./LayoutMetrics";

export class MarkdownMeasurer {
  measure(_text: string | undefined | null): number {
    if (!_text || !_text.trim()) {
      return 0;
    }

    const commentObj = new Comment(_text);
    const tokens = lexComment(commentObj?.text ?? "");
    if (!tokens.length) {
      return 0;
    }

    // Emptiness is decided on the lexed Comment.text (style annotations
    // stripped), because marked can return no tokens for non-blank text, e.g.
    // a link reference definition or an annotation-only comment. The line
    // count uses the raw _text: the annotation line is still a line of source
    // that the renderers lay out. MarkdownMeasurer.spec.ts pins both.
    const lines = _text.trim().split("\n");

    return lines.length * COMMENT_LINE_HEIGHT;
  }
}
