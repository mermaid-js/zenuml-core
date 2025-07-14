import { cn } from "@/utils";
import { Message } from "../Message";
import { Occurrence } from "../Interaction/Occurrence/Occurrence";
import { CodeRange } from "@/parser/CodeRange";
import {
  LIFELINE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";
import CommentClass from "@/components/Comment/Comment";
import { useAtomValue } from "jotai";
import { cursorAtom, onElementClickAtom } from "@/store/Store";
import { Comment } from "../Comment/Comment";
import { useEffect, useMemo, useRef, useState } from "react";
import { useArrow } from "../useArrow";
import { EventBus } from "@/EventBus";

export const Creation = (props: {
  context?: any;
  origin?: any;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  layoutData?: {
    signature: string;
    target: string;
    assignee?: string;
    translateX: number;
    interactionWidth: number;
    rightToLeft: boolean;
    containerOffset: number;
    isCurrent: boolean;
    style?: React.CSSProperties;
  };
}) => {
  // Determine which architecture to use
  const isNewArchitecture = !!props.layoutData;
  
  // Always call hooks at top level to maintain hook order
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const cursor = useAtomValue(cursorAtom);
  const onElementClick = useAtomValue(onElementClickAtom);
  const [participantWidth, setParticipantWidth] = useState(0);
  
  // Pre-calculate old architecture values
  const creation = props.context?.creation();
  const arrowData = useArrow({
    context: props.context,
    origin: props.origin,
    source: props.origin,
    target: creation?.Owner(),
  });

  // Extract unified data
  const target = isNewArchitecture ? props.layoutData!.target : creation?.Owner();
  const signature = isNewArchitecture ? props.layoutData!.signature : creation?.SignatureText();
  const translateX = isNewArchitecture ? props.layoutData!.translateX : arrowData.translateX;
  const interactionWidth = isNewArchitecture ? props.layoutData!.interactionWidth : arrowData.interactionWidth;
  const rightToLeft = isNewArchitecture ? props.layoutData!.rightToLeft : arrowData.rightToLeft;
  const isCurrent = isNewArchitecture ? props.layoutData!.isCurrent : creation?.isCurrent(cursor);

  const messageTextStyle = props.commentObj?.messageStyle;
  const messageClassNames = props.commentObj?.messageClassNames;

  const assignee = useMemo(() => {
    if (isNewArchitecture) {
      return props.layoutData!.assignee || "";
    }
    function safeCodeGetter(context: any) {
      return (context && context.getFormattedText()) || "";
    }
    const assignment = creation?.creationBody().assignment();
    if (!assignment) return "";
    const assignee = safeCodeGetter(assignment.assignee());
    // For return messages, we only want the assignee name, not the full "assignee:type" format
    return assignee;
  }, [isNewArchitecture, props.layoutData, creation]);

  const containerOffset = isNewArchitecture 
    ? props.layoutData!.containerOffset 
    : participantWidth / 2 - OCCURRENCE_BAR_SIDE_WIDTH - LIFELINE_WIDTH;

  useEffect(() => {
    if (isNewArchitecture) {
      // Skip DOM manipulation in new architecture
      return;
    }
    
    const participantElement = document.querySelector(
      `[data-participant-id="${target}"]`,
    );

    if (!participantElement) {
      console.error(`Could not find participant element for ${target}`);
      setParticipantWidth(0);
      return;
    }

    // Get the actual width from the DOM element
    setParticipantWidth(participantElement.getBoundingClientRect().width);
    console.debug(
      `Found participant element for ${target}, width: ${participantWidth}px`,
    );

    EventBus.emit("participant_set_top");
    console.debug(`Init or update message container for ${target}`);
  }, [isNewArchitecture, target, participantWidth]);

  return (
    <div
      data-origin={props.origin}
      className={cn(
        "interaction creation sync",
        {
          "right-to-left": rightToLeft,
          highlight: isCurrent,
        },
        props.className,
      )}
      onClick={() => onElementClick(CodeRange.from(props.context))}
      data-signature={signature}
      style={{
        transform: "translateX(" + translateX + "px)",
        width: interactionWidth + "px",
        ...(isNewArchitecture ? props.layoutData!.style : {}),
      }}
    >
      {props.comment && <Comment commentObj={props.commentObj} />}
      <div
        ref={messageContainerRef}
        data-type="creation"
        className={cn(
          "message-container pointer-events-none flex items-center h-10 relative",
          { "flex-row-reverse": rightToLeft },
        )}
        data-to={target}
      >
        <Message
          className={cn(
            "invocation w-full transform -translate-y-1/2 pointer-events-auto",
            messageClassNames,
          )}
          context={isNewArchitecture ? undefined : creation}
          content={signature}
          rtl={rightToLeft}
          type="creation"
          number={props.number}
          textStyle={messageTextStyle}
          style={{ width: `calc(100% - ${containerOffset}px)` }}
        />
      </div>
      <Occurrence
        context={isNewArchitecture ? undefined : creation}
        className="pointer-events-auto"
        participant={target}
        number={props.number}
      />
      {assignee && (
        <Message
          className={cn(
            "return transform -translate-y-full pointer-events-auto",
            messageClassNames,
          )}
          textStyle={messageTextStyle}
          context={isNewArchitecture ? undefined : creation?.creationBody().assignment()}
          content={assignee}
          rtl={!rightToLeft}
          type="return"
          number={`${props.number}.${isNewArchitecture ? "2" : creation?.Statements().length + 1}`}
        />
      )}
    </div>
  );
};
