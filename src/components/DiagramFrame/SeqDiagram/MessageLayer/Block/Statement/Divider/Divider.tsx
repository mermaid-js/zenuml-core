import { coordinatesAtom, participantsAtom } from "@/store/Store";
import { cn } from "@/utils";
import { getStyle } from "@/utils/messageStyling";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { centerOf } from "../utils";

export const Divider = (props: {
  context: any;
  origin: string;
  className?: string;
}) => {
  const participants = useAtomValue(participantsAtom);
    const coordinates = useAtomValue(coordinatesAtom);

  const width = useMemo(() => {
    // TODO: with should be the width of the whole diagram
    const rearParticipant = participants.Names().pop();
    // 20px for the right margin of the participant
    return centerOf(coordinates, rearParticipant) + 10;
  }, [participants]);

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

  return (
    <div
      className={cn("divider", props.className)}
      data-origin={props.origin}
      style={{
        width: width + "px",
        transform: "translateX(" + (-1 * centerOfOrigin + 10) + "px)",
        display: "flex",
        alignItems: "center",
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
          padding: "4px 8px",
          fontSize: 14,
          color: "#333",
          whiteSpace: "nowrap",
        }}
        className={cn("name", messageStyle.style.classNames)}
      >
        {cleanNote}
      </div>
      <div className="right" style={{ flex: 1, height: 1, backgroundColor: "#aaaa33" }}></div>
    </div>
  );
};
