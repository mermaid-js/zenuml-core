import {
  diagramElementAtom,
  modeAtom, progVMAtom,
  RenderMode,
  themeAtom,
} from "@/store/Store";
import { useAtomValue, useSetAtom } from "jotai";
import {
  CSSProperties,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import "./SeqDiagram.css";
import { cn } from "@/utils";
import { LifeLineLayer } from "./LifeLineLayer/LifeLineLayer";
import { MessageLayer } from "./MessageLayer/MessageLayer";
import { DebugLabel } from "./MessageLayer/Block/Statement/DebugLabel";

export const SeqDiagram = (props: {
  className?: string;
  style?: CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const progVM = useAtomValue(progVMAtom);
  const theme = useAtomValue(themeAtom);
  const mode = useAtomValue(modeAtom);
  const setDiagramElement = useSetAtom(diagramElementAtom);

  const diagramRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setDiagramElement(diagramRef.current);
  });

  useImperativeHandle(props.ref, () => {
    return diagramRef.current!;
  });

  const frameBorderLeft = progVM?.rootBlockVM.border?.left || 0;

  const width = (progVM?.totalWidth || FRAGMENT_MIN_WIDTH) - (progVM?.rootBlockVM.border?.left || 0);

  return (
    <div
      className={cn(
        "zenuml sequence-diagram relative box-border text-left overflow-visible px-2.5",
        theme,
        props.className,
      )}
      style={props.style}
      ref={diagramRef}
    >
      {/* Debug Label - positioned absolutely to not affect layout */}
      <DebugLabel 
        origin={progVM?.origin}
        leftParticipant={progVM?.leftParticipant}
        offsetX={width}
        className="top-0 left-0 text-xs z-50"
        style="absolute"
      />
      
      {/* .zenuml is used to make sure tailwind css takes effect when naked == true;
      .bg-skin-base is repeated because .zenuml reset it to default theme. */}
      <div
        style={{ paddingLeft: `${frameBorderLeft}px` }}
        className="relative z-container"
      >
        {mode === RenderMode.Dynamic ? (
          <>
            {/* Why do we have two `life-line-layer`s? This is introduced when we add support of
              floating participant. Essentially, the Participant labels must be on the top
              of message layer and the lines of lifelines must be under the message layer. */}
            <LifeLineLayer leftGap={frameBorderLeft} vm={progVM} renderLifeLine />
            <MessageLayer style={{ width: `${width}px` }} />
            <LifeLineLayer leftGap={frameBorderLeft} vm={progVM} renderParticipants />
          </>
        ) : (
          <>
            <LifeLineLayer leftGap={frameBorderLeft} renderParticipants renderLifeLine />
            <MessageLayer style={{ width: `${width}px` }} />
          </>
        )}
      </div>
    </div>
  );
};
