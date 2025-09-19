import FrameBorder from "@/positioning/FrameBorder";
import {
  coordinatesAtom,
  framesModelAtom,
  messagesModelAtom,
  diagramElementAtom,
  modeAtom,
  RenderMode,
  rootContextAtom,
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

export const SeqDiagram = (props: {
  className?: string;
  style?: CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const theme = useAtomValue(themeAtom);
  const mode = useAtomValue(modeAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const framesModel = useAtomValue(framesModelAtom);
  const messages = useAtomValue(messagesModelAtom);
  const setDiagramElement = useSetAtom(diagramElementAtom);

  const diagramRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setDiagramElement(diagramRef.current);
  });

  useImperativeHandle(props.ref, () => {
    return diagramRef.current!;
  });

  const frameBorderLeft = useMemo(() => {
    return FrameBorder(framesModel.root).left;
  }, [framesModel]);

  const width = useMemo(() => {
    const contextWidth = TotalWidth(coordinates, messages, framesModel.root);
    //   [MessageLayer width] <- contextWidth
    //  [Frame width        ]
    // || <- frameBorderLeft extra width provided by container
    return contextWidth - frameBorderLeft;
  }, [messages, coordinates, framesModel.root, frameBorderLeft]);

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
            <LifeLineLayer leftGap={frameBorderLeft} renderLifeLine />
            <MessageLayer style={{ width: `${width}px` }} />
            <LifeLineLayer leftGap={frameBorderLeft} renderParticipants />
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
