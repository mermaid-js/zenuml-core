import { coordinatesAtom, participantsAtom } from "@/store/Store";
import { cn } from "@/utils";
import { getStyle } from "@/utils/messageStyling";
import { useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { centerOf } from "../utils";
import { convertEmojiShortcodes } from "@/utils/emoji";

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
      const [style, _note] = [
        note.slice(startIndex + 1, endIndex),
        note.slice(endIndex + 1),
      ];
      return {
        style: getStyle(style.split(",").map((s: string) => s.trim())),
        note: _note,
      };
    }
    return { style: getStyle([]), note: note };
  }, [note]);

  const cleanNote = messageStyle.note.replace(/^=+\s*|\s*=+$/g, "").trim();

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
        {convertEmojiShortcodes(cleanNote)}
      </div>
      <div className="right" style={{ flex: 1, height: 1, backgroundColor: "#aaaa33" }}></div>
    </div>
  );
};
