import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import {
  coordinatesAtom,
  diagramElementAtom,
  modeAtom,
  RenderMode,
  rootContextAtom,
  selectedAtom,
  selectedMessageAtom,
  themeAtom,
} from "@/store/Store";
import { useAtomValue, useSetAtom } from "jotai";
import {
  CSSProperties,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { TotalWidth } from "./WidthOfContext";
import "./SeqDiagram.css";
import { cn } from "@/utils";
import { LifeLineLayer } from "./LifeLineLayer/LifeLineLayer";
import { MessageLayer } from "./MessageLayer/MessageLayer";
import { ParticipantInsertControls } from "./LifeLineLayer/ParticipantInsertControls";

export const SeqDiagram = (props: {
  className?: string;
  style?: CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const theme = useAtomValue(themeAtom);
  const mode = useAtomValue(modeAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const setDiagramElement = useSetAtom(diagramElementAtom);
  const setSelectedParticipants = useSetAtom(selectedAtom);
  const setSelectedMessage = useSetAtom(selectedMessageAtom);

  const diagramRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setDiagramElement(diagramRef.current);
  });

  useImperativeHandle(props.ref, () => {
    return diagramRef.current!;
  });

  const frameBorderLeft = useMemo(() => {
    const allParticipants = coordinates.orderedParticipantNames();
    const frameBuilder = new FrameBuilder(allParticipants);
    const frame = frameBuilder.getFrame(rootContext);
    return frame ? FrameBorder(frame).left : 0;
  }, [coordinates, rootContext]);

  const width = useMemo(() => {
    const contextWidth = TotalWidth(rootContext, coordinates);
    //   [MessageLayer width] <- contextWidth
    //  [Frame width        ]
    // || <- frameBorderLeft extra width provided by container
    return contextWidth - frameBorderLeft;
  }, [rootContext, coordinates, frameBorderLeft]);

  return (
    <div
      className={cn(
        "zenuml sequence-diagram relative box-border text-left overflow-visible px-2.5",
        theme,
        props.className,
      )}
      style={props.style}
      ref={diagramRef}
      onClick={(event) => {
        const target = event.target as HTMLElement | null;
        if (
          target?.closest(".interaction") ||
          target?.closest(".participant") ||
          target?.closest("#style-panel")
        ) {
          return;
        }
        setSelectedParticipants([]);
        setSelectedMessage(null);
      }}
    >
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
            <LifeLineLayer
              leftGap={frameBorderLeft}
              context={rootContext?.head()}
              renderLifeLine
            />
            <MessageLayer
              context={rootContext?.block()}
              style={{ width: `${width}px` }}
            />
            <LifeLineLayer
              leftGap={frameBorderLeft}
              context={rootContext?.head()}
              renderParticipants
            />
            {/* Insert controls on a separate layer above participants.
               pointer-events: none lets clicks pass through to the participant
               layer below; individual "+" buttons opt back in. */}
            <div
              className="absolute h-full top-0 pt-2"
              style={{
                width: `calc(100% - ${frameBorderLeft}px)`,
                pointerEvents: "none",
                zIndex: 40,
              }}
            >
              <div className="relative grow h-full">
                <ParticipantInsertControls />
              </div>
            </div>
          </>
        ) : (
          <>
            <LifeLineLayer
              leftGap={frameBorderLeft}
              context={rootContext?.head()}
              renderParticipants
              renderLifeLine
            />
            <MessageLayer
              context={rootContext?.block()}
              style={{ width: `${width}px` }}
            />
          </>
        )}
      </div>
    </div>
  );
};
