import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { SelfInvocation } from "./SelfInvocation/SelfInvocation";
import { Message } from "../Message";
import { Occurrence } from "./Occurrence/Occurrence";
import { useAtomValue } from "jotai";
import { cursorAtom } from "@/store/Store";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { Comment } from "../Comment/Comment";
import { useArrow } from "../useArrow";
import { InteractionLayout } from "@/domain/models/DiagramLayout";

export const Interaction = (props: {
  context: any;
  origin: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  layoutData?: InteractionLayout;
}) => {
  // Always call hooks to maintain order
  const cursor = useAtomValue(cursorAtom);
  
  // Determine if using new or old architecture
  const isNewArchitecture = !!props.layoutData;
  
  // Pre-calculate values for useArrow hook (always called to maintain hook order)
  const messageTextStyle = props.commentObj?.messageStyle;
  const messageClassNames = props.commentObj?.messageClassNames;
  const message = props.context?.message();
  const statements = message?.Statements();
  const assignee = message?.Assignment()?.getText() || "";
  const signature = message?.SignatureText();
  const isCurrent = message?.isCurrent(cursor);
  const source = message?.From() || _STARTER_;
  const target = props.context?.message()?.Owner() || _STARTER_;
  const isSelf = source === target;

  // Always call useArrow hook to maintain hook order
  const arrowData = useArrow({
    context: props.context,
    origin: props.origin,
    source,
    target,
  });
  
  // For old architecture, collect all data
  let oldArchData = null;
  if (!isNewArchitecture) {
    oldArchData = {
      messageTextStyle,
      messageClassNames,
      message,
      statements,
      assignee,
      signature,
      isCurrent,
      source,
      target,
      isSelf,
      ...arrowData
    };
  }
  
  // Extract data based on architecture
  const data = isNewArchitecture
    ? {
        messageTextStyle: props.commentObj?.messageStyle,
        messageClassNames: props.commentObj?.messageClassNames,
        message: null, // New architecture doesn't need raw context
        statements: props.layoutData!.statements || [],
        assignee: props.layoutData!.assignee || "",
        signature: props.layoutData!.signature,
        isCurrent: false, // TODO: Handle current state in new architecture
        source: props.layoutData!.source,
        target: props.layoutData!.target,
        isSelf: props.layoutData!.isSelf,
        translateX: props.layoutData!.translateX,
        interactionWidth: props.layoutData!.interactionWidth,
        originLayers: props.layoutData!.originLayers,
        sourceLayers: props.layoutData!.sourceLayers,
        targetLayers: props.layoutData!.targetLayers,
        rightToLeft: props.layoutData!.rightToLeft,
      }
    : oldArchData!;

  return (
    <div
      className={cn(
        "interaction sync inline-block",
        {
          highlight: data.isCurrent,
          self: data.isSelf,
          "right-to-left": data.rightToLeft,
        },
        props.className,
      )}
      onClick={(e) => e.stopPropagation()}
      data-to={data.target}
      data-origin={props.origin}
      data-source={data.source}
      data-target={data.target}
      data-origin-layers={data.originLayers}
      data-source-layers={data.sourceLayers}
      data-target-layers={data.targetLayers}
      data-type="interaction"
      data-signature={data.signature}
      style={{
        width: data.isSelf ? undefined : data.interactionWidth + "px",
        transform: "translateX(" + data.translateX + "px)",
      }}
    >
      {props.commentObj?.text && <Comment commentObj={props.commentObj} />}
      {data.isSelf ? (
        <SelfInvocation
          layoutData={isNewArchitecture ? {
            assignee: data.assignee,
            signatureText: data.signature,
            labelPosition: [-1, -1], // TODO: Pass proper label position in new architecture
            number: props.number,
            textStyle: data.messageTextStyle,
            classNames: data.messageClassNames,
          } : undefined}
          classNames={data.messageClassNames}
          textStyle={data.messageTextStyle}
          context={data.message}
          number={props.number}
        />
      ) : (
        <Message
          layoutData={isNewArchitecture ? {
            content: data.signature,
            rtl: data.rightToLeft,
            type: "sync",
            textStyle: data.messageTextStyle,
            className: cn("text-center", data.messageClassNames),
            number: props.number,
          } : undefined}
          className={cn("text-center", data.messageClassNames)}
          textStyle={data.messageTextStyle}
          context={data.message}
          content={data.signature}
          rtl={data.rightToLeft}
          number={props.number}
          type="sync"
        />
      )}
      <Occurrence
        context={data.message}
        participant={data.target}
        rtl={data.rightToLeft}
        number={props.number}
      />
      {data.assignee && !data.isSelf && (
        <Message
          layoutData={isNewArchitecture ? {
            content: data.assignee,
            rtl: !data.rightToLeft,
            type: "return",
            textStyle: data.messageTextStyle,
            className: cn("return transform -translate-y-full", data.messageClassNames),
            number: `${props.number}.${data.statements.length + 1}`,
          } : undefined}
          className={cn(
            "return transform -translate-y-full",
            data.messageClassNames,
          )}
          context={data.message}
          content={data.assignee}
          rtl={!data.rightToLeft}
          type="return"
          number={`${props.number}.${data.statements.length + 1}`}
          textStyle={data.messageTextStyle}
        />
      )}
    </div>
  );
};
