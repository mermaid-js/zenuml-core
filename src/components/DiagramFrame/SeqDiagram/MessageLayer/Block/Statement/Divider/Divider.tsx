import { participantsAtom } from "@/store/Store";
import { cn } from "@/utils";
import { getStyle } from "@/utils/messageStyling";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { getParticipantCenter } from "@/positioning/GeometryUtils";
import { DividerLayout } from "@/domain/models/DiagramLayout";

/**
 * Internal component that renders using pre-calculated layout
 */
const DividerWithLayout = ({ 
  layout, 
  className 
}: { 
  layout: DividerLayout; 
  className?: string;
}) => {
  return (
    <div
      className={cn("divider", className)}
      style={{
        width: layout.bounds.width + "px",
        transform: "translateX(" + layout.bounds.x + "px)",
      }}
    >
      <div className="left bg-skin-divider"></div>
      <div
        style={layout.style?.textStyle}
        className={cn("name", ...(layout.style?.classNames || []))}
      >
        {layout.text}
      </div>
      <div className="right bg-skin-divider"></div>
    </div>
  );
};

export const Divider = (props: {
  context?: any;
  origin?: string;
  layoutData?: DividerLayout;  // New optional prop
  className?: string;
}) => {
  // If layout data is provided, use the new rendering path
  if (props.layoutData) {
    console.log('[Divider] Using NEW architecture for:', props.layoutData.text);
    return <DividerWithLayout layout={props.layoutData} className={props.className} />;
  }
  
  // Otherwise, fall back to the original implementation
  if (!props.context || !props.origin) {
    console.warn('Divider: Neither layoutData nor context/origin provided');
    return null;
  }
  
  console.log('[Divider] Using OLD architecture');
  
  const participants = useAtomValue(participantsAtom);

  const width = useMemo(() => {
    // TODO: with should be the width of the whole diagram
    const rearParticipant = participants.Names().pop();
    // 20px for the right margin of the participant
    return getParticipantCenter(rearParticipant) + 10;
  }, [participants]);

  const centerOfOrigin = getParticipantCenter(props.origin);

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
