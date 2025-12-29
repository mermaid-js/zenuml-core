import { marked } from "marked";
import DOMPurify from "dompurify";
import Comment from "../../components/Comment/Comment";

const defaultTokensOptions = {
  gfm: true,
  breaks: true,
};

export class MarkdownMeasurer {
  measure(_text: string | undefined | null): number {
    if (!_text || !_text.trim()) {
      return 0;
    }

    const commentObj = new Comment(_text);
    const text = DOMPurify.sanitize(
      commentObj?.text && marked.parse(commentObj?.text),
    );

    const tokens = marked.lexer(text, defaultTokensOptions);
    if (!tokens.length) {
      return 0;
    }

    const lines = _text.trim().split("\n");
    // console.info(
    //   "MarkdownMeasurer",
    //   `commentObj?.text ${commentObj?.text}`,
    //   `lines.length ${lines.length}`,
    //   `DOMPurify ${text}`,
    //   `tokens", ${JSON.stringify(tokens)}`,
    // );

    return lines.length * 20;
  }
}
