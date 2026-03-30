import { StatementVM } from "./StatementVM";
import { resolveEmojiInText } from "@/emoji/resolveEmoji";

const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/u;

const CONDITION_LABEL_HEIGHT_PLAIN = 20;
const CONDITION_LABEL_HEIGHT_EMOJI = 36;

export abstract class FragmentVM extends StatementVM {
  /**
   * Returns the height of a fragment condition label row.
   * When the resolved text contains emoji glyphs, the browser line-height
   * expands to ~36px; plain text stays at 20px.
   */
  protected conditionLabelHeight(text: string): number {
    const resolved = resolveEmojiInText(text);
    return EMOJI_PATTERN.test(resolved)
      ? CONDITION_LABEL_HEIGHT_EMOJI
      : CONDITION_LABEL_HEIGHT_PLAIN;
  }
  protected beginFragment(context: any, top: number) {
    const commentHeight = this.measureComment(context);
    const headerHeight = this.metrics.fragmentHeaderHeight;

    return {
      cursor: top + commentHeight + headerHeight,
      commentHeight,
      headerHeight,
    };
  }

  protected finalizeFragment(top: number, cursor: number) {
    cursor += this.metrics.fragmentPaddingBottom;
    return {
      top,
      height: cursor - top,
    } as const;
  }
}
