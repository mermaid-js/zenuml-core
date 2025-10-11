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
  top?: number;
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

  return (
    <div
      className={cn("divider", props.className)}
      data-origin={props.origin}
      style={{
        width: width + "px",
        transform: "translateX(" + (-1 * centerOfOrigin + 10) + "px)",
      }}
    >
      <div className="left bg-skin-divider"></div>
      <div
        style={messageStyle.style.textStyle}
        className={cn("name", messageStyle.style.classNames)}
      >
        {messageStyle.note}
      </div>
      <div className="right bg-skin-divider"></div>
    </div>
  );
};
