import { measureTextWithFont } from "./WidthProviderFunc";
import { resolveEmojiInText } from "@/emoji/resolveEmoji";

export const fragmentGuardKeyword = (kind: string, sourceKeyword?: string) =>
  kind === "alt" || kind === "opt"
    ? "if"
    : kind === "loop"
      ? (sourceKeyword ?? "loop")
      : undefined;

/** Two 1px borders, two 4px insets, and a 4px keyword-to-condition gap. */
export const fragmentGuardWidth = (condition: string, keyword?: string) =>
  Math.ceil(
    10 +
      measureTextWithFont(resolveEmojiInText(condition), "14px") +
      (keyword
        ? measureTextWithFont(keyword, "12px", "all-small-caps") +
          (condition ? 4 : 0)
        : 0),
  );
