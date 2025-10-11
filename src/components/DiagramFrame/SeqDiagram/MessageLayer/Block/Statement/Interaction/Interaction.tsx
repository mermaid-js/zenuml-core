import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { SelfInvocation } from "./SelfInvocation/SelfInvocation";
import { Message } from "../Message";
import { Occurrence } from "./Occurrence/Occurrence";
import { useAtomValue } from "jotai";
import {
  cursorAtom,
  onMessageClickAtom
} from "@/store/Store";
import { DebugLabel } from "../DebugLabel";
import { _STARTER_ } from "@/constants";
import { Comment } from "../Comment/Comment";
import type { MessageVM } from "@/vm/types";
import { isCursorInRange } from "../utils";

export const Interaction = (props: {
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  vm?: MessageVM & {
    arrow?: {
      translateX: number;
      interactionWidth: number;
      rightToLeft: boolean;
    }
  };
}) => {
  const cursor = useAtomValue(cursorAtom);
  const messageTextStyle = props.commentObj?.messageStyle;
  const messageClassNames = props.commentObj?.messageClassNames;
  const vm = props.vm;
  const assignee = vm?.assignee || "";
  const onMessageClick = useAtomValue(onMessageClickAtom);
  const signature = vm?.signature;
  const isSelf = vm?.isSelf;
  const isCurrent = isCursorInRange(cursor, vm?.range ?? null);

  // Extract arrow geometry from VM with null safety
  const translateX = vm?.arrow?.translateX ?? 0;
  const interactionWidth = vm?.arrow?.interactionWidth ?? 0;
  const rightToLeft = vm?.arrow?.rightToLeft ?? false;
  return (
    <div
      className={cn(
        "interaction sync inline-block relative",
        {
          highlight: isCurrent,
          self: isSelf,
          "right-to-left": rightToLeft,
        },
        props.className,
      )}
      onClick={(e) => e.stopPropagation()}
      data-type="interaction"
      data-signature={signature}
      style={{
        width: isSelf ? undefined : interactionWidth + "px",
        transform: "translateX(" + translateX + "px)",
      }}
    >
      {props.commentObj?.text && <Comment commentObj={props.commentObj} />}
      {isSelf ? (
        <SelfInvocation
          classNames={messageClassNames}
          textStyle={messageTextStyle}
          number={props.number}
          vm={vm!}
        />
      ) : (
        <Message
          className={cn("text-center", messageClassNames)}
          textStyle={messageTextStyle}
          labelText={signature}
          rtl={rightToLeft}
          number={props.number}
          type="sync"
          stylable={true}
          labelRange={vm?.labelRange ?? null}
          onOpenStylePanel={(element) => {
            if (!element || !vm?.codeRange) return;
            onMessageClick(vm.codeRange, element);
          }}
        />
      )}
      <DebugLabel 
        style="absolute"
      />
 
      {(() => {
        return vm.blockVM ? (
          <Occurrence
            number={props.number}
            vm={vm.blockVM}
          />
        ) : null;
      })()}
      {assignee && !isSelf && (
        <Message
          className={cn(
            "return transform -translate-y-full",
            messageClassNames,
          )}
          labelText={assignee}
          rtl={!rightToLeft}
          type="return"
          number={`${props.number}.${(vm?.blockVM.statements.length ?? 0) + 1}`}
          textStyle={messageTextStyle}
          stylable={false}
          onOpenStylePanel={(element) => {
            if (!element || !vm?.codeRange) return;
            onMessageClick(vm.codeRange, element);
          }}
        />
      )}
    </div>
  );
};
