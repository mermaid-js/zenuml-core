import { coordinatesAtom, participantsAtom } from "@/store/Store";
import { cn } from "@/utils";
import { getStyle } from "@/utils/messageStyling";
import { resolveBracketContent, getEmojiUnicode } from "@/emoji/resolveEmoji";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { centerOf } from "../utils";

// Theme slots for the divider. These stay inline (not Tailwind classes) so a
// bracket style such as `== [red] note ==` keeps the precedence it has today.
// The chains must match tailwind.config.js `*.skin.divider` / `divider-line`;
// src/svg/themes.spec.ts checks that.
const DIVIDER_LINE = "var(--color-border-divider, #aaaa33)";
const DIVIDER_BG = "var(--color-bg-divider, #fff5ad)";
const DIVIDER_TEXT = "var(--color-text-divider, #333)";

export const Divider = (props: {
  context: any;
  origin: string;
  className?: string;
}) => {
  useAtomValue(participantsAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const diagramWidth = useMemo(() => {
    return coordinates.getWidth();
  }, [coordinates]);

  const centerOfOrigin = centerOf(coordinates, props.origin);

  const note = props.context.divider().Note();

  const messageStyle = useMemo(() => {
    if (note.trim().indexOf("[") === 0 && note.indexOf("]") !== -1) {
      const startIndex = note.indexOf("[");
      const endIndex = note.indexOf("]");
      const bracketContent = note.slice(startIndex + 1, endIndex);
      const remainingNote = note.slice(endIndex + 1);

      const resolution = resolveBracketContent(bracketContent);
      const emojiPrefix = resolution.emojis
        .map((name) => getEmojiUnicode(name))
        .join("") + (resolution.emojis.length > 0 ? " " : "");

      // Build CSS style from resolution (non-emoji values)
      const cssValues = resolution.classNames.filter((c) => !resolution.emojis.includes(c));
      return {
        style: getStyle(cssValues),
        note: emojiPrefix + remainingNote,
      };
    }
    return { style: getStyle([]), note: note };
  }, [note]);

  const cleanNote = messageStyle.note.replace(/^=+\s*|\s*=+$/g, "").trim();

  // Pull the full-width divider back to the diagram content origin (x=0 in the
  // lifeline coordinate system). The divider's natural left edge sits at the
  // cumulative indentation of all ancestor occurrences — which equals the
  // origin participant's center — so translateX(-centerOfOrigin) lands the left
  // edge at the diagram origin regardless of nesting depth. (Reading a single
  // block's padding-left here is wrong: nested blocks have padding-left=0, which
  // left deep dividers un-shifted and overflowing off the right edge — #392.)
  return (
    <div
      className={cn("divider", props.className)}
      data-origin={props.origin}
      style={{
        width: diagramWidth + "px",
        transform: "translateX(" + (-1 * centerOfOrigin) + "px)",
        display: "flex",
        alignItems: "center",
        height: 40,
        gap: 0,
      }}
    >
      {/* Rules are borders, not backgrounds: forced-colors mode keeps borders. */}
      <div className="left" style={{ flex: 1, height: 0, borderTop: `1px solid ${DIVIDER_LINE}` }}></div>
      <div
        style={{
          ...messageStyle.style.textStyle,
          backgroundColor: DIVIDER_BG,
          border: `1px solid ${DIVIDER_LINE}`,
          borderRadius: 2,
          boxSizing: "border-box" as const,
          height: 28,
          padding: "0 8px",
          fontSize: 14,
          lineHeight: "26px",
          color: DIVIDER_TEXT,
          whiteSpace: "nowrap",
        }}
        className={cn("name", messageStyle.style.classNames)}
      >
        {cleanNote}
      </div>
      <div className="right" style={{ flex: 1, height: 0, borderTop: `1px solid ${DIVIDER_LINE}` }}></div>
    </div>
  );
};
