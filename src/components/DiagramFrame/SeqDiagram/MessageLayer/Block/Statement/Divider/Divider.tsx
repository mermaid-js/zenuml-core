import { coordinatesAtom } from "@/store/Store";
import { cn } from "@/utils";
import { getStyle } from "@/utils/messageStyling";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { centerOf } from "../utils";

type DividerVM = {
  note: string;
  rawNote: string;
  width: number;
  translateX: number;
  styling: { styles?: string[] };
};

export const Divider = (props: {
  context: any;
  origin: string;
  className?: string;
  vm?: DividerVM;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);

  // Use VM data if available, otherwise calculate
  const width = useMemo(() => {
    if (props.vm?.width !== undefined) {
      return props.vm.width;
    }
    const names = coordinates.orderedParticipantNames();
    const rearParticipant = names[names.length - 1];
    return centerOf(coordinates, rearParticipant) + 10;
  }, [props.vm?.width, coordinates]);

  const translateX = useMemo(() => {
    if (props.vm?.translateX !== undefined) {
      return props.vm.translateX;
    }
    const centerOfOrigin = centerOf(coordinates, props.origin);
    return -1 * centerOfOrigin + 10;
  }, [props.vm?.translateX, coordinates, props.origin]);

  const note = props.vm?.rawNote ?? props.context.divider().Note();

  const messageStyle = useMemo(() => {
    // If VM has styling info, use it without parity checks
    if (props.vm?.styling?.styles) {
      return {
        style: getStyle(props.vm.styling.styles),
        note: props.vm.note,
      };
    }
    // Fallback parsing
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
  }, [props.vm, note]);

  return (
    <div
      className={cn("divider flex items-center", props.className)}
      data-origin={props.origin}
      style={{
        width: width + "px",
        transform: "translateX(" + translateX + "px)",
      }}
    >
      <div className="left bg-skin-divider flex-1 h-px"></div>
      <div
        style={messageStyle.style.textStyle}
        className={cn("name text-center px-2", messageStyle.style.classNames)}
      >
        {messageStyle.note}
      </div>
      <div className="right bg-skin-divider flex-1 h-px"></div>
    </div>
  );
};
