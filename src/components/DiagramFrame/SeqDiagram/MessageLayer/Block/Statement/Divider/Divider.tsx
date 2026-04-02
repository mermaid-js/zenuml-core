import {
  codeAtom,
  coordinatesAtom,
  modeAtom,
  onContentChangeAtom,
  participantsAtom,
  RenderMode,
} from "@/store/Store";
import { cn } from "@/utils";
import { getStyle } from "@/utils/messageStyling";
import { resolveBracketContent, getEmojiUnicode } from "@/emoji/resolveEmoji";
import { EditableSpan } from "@/components/common/EditableSpan";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { centerOf } from "../utils";

export const Divider = (props: {
  context: any;
  origin: string;
  className?: string;
}) => {
  useAtomValue(participantsAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
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
  const isEditable = mode !== RenderMode.Static;

  const handleSave = (newText: string) => {
    if (!newText || newText === cleanNote) return;
    const dividerNote = props.context.divider().dividerNote();
    const start = dividerNote.start.start;
    const end = dividerNote.stop.stop + 1;
    const newCode = code.slice(0, start) + `==${newText}==` + code.slice(end);
    setCode(newCode);
    onContentChange(newCode);
  };

  // Align with the lifeline-layer (same x=0 as SVG coordinate system).
  // The block has padding-left that positions the statement-container;
  // we need to offset back by that full padding to reach the content origin.
  const refCallback = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const stmtContainer = el.parentElement;
    const block = stmtContainer?.parentElement;
    if (!block) return;
    const blockPadding = parseFloat(getComputedStyle(block).paddingLeft) || 0;
    el.style.transform = `translateX(-${blockPadding}px)`;
  }, []);

  return (
    <div
      ref={refCallback}
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
      <div className="left" style={{ flex: 1, height: 1, backgroundColor: "#aaaa33" }}></div>
      <div
        style={{
          ...messageStyle.style.textStyle,
          backgroundColor: "#fff5ad",
          border: "1px solid #aaaa33",
          borderRadius: 2,
          boxSizing: "border-box" as const,
          height: 28,
          padding: "0 8px",
          fontSize: 14,
          lineHeight: "26px",
          color: "#333",
          whiteSpace: "nowrap",
        }}
        className={cn("name", messageStyle.style.classNames)}
      >
        {isEditable ? (
          <EditableSpan
            text={cleanNote}
            isEditable={true}
            onSave={handleSave}
            title="Click to edit divider label"
          />
        ) : (
          cleanNote
        )}
      </div>
      <div className="right" style={{ flex: 1, height: 1, backgroundColor: "#aaaa33" }}></div>
    </div>
  );
};
