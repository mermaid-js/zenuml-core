import { CollapseButton } from "./CollapseButton";
import { EventBus } from "@/EventBus";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils";
import { Block } from "../../../Block";
import { centerOf } from "../../utils";
import { useAtomValue } from "jotai";
import { coordinatesAtom } from "@/store/Store";
import { Message } from "../../Message/Message";
import { syncMessageNormalizer } from "@/utils/messageNormalizers";
import { CSSProperties } from "react";

export const Occurrence = (props: {
  context: any;
  participant: any;
  rtl?: boolean;
  number?: string;
  className?: string;
  textStyle?: CSSProperties;
  messageClassNames?: string[];
  isSelf?: boolean;
  interactionWidth?: number;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);
  const [collapsed, setCollapsed] = useState(false);

  const debug = localStorage.getItem("zenumlDebug");

  const computedCenter = () => {
    try {
      return centerOf(coordinates, props.participant);
    } catch (e) {
      console.error(e);
      return 0;
    }
  };
  const hasAnyStatementsExceptReturn = () => {
    const braceBlock = props.context.braceBlock();
    if (!braceBlock) return false;
    const stats = braceBlock.block()?.stat() || [];
    const len = stats.length;
    if (len > 1) return true;
    //when the only one statement is not the RetContext
    return len === 1 && stats[0]["ret"]() == null;
  };
  const toggle = () => {
    setCollapsed(!collapsed);

    //update participant top in this cases: has child and sibling creation statement
    //e.g. : a.call() { b = new B(); b.call() { c = new C() c.call(){return}}}
    EventBus.emit("participant_set_top");
  };

  useEffect(() => {
    setCollapsed(false);
  }, [props.context]);

  const assigneeData = useMemo(() => {
    // Check if context has Assignment function (works for both CreationContext and MessageContext)
    if (typeof props.context?.Assignment !== 'function') {
      return null;
    }
    
    const assignment = props.context.Assignment();
    if (!assignment) return null;
    const content = assignment.getText() || "";
    if (!content) return null;
    return { content, labelPosition: assignment.labelPosition };
  }, [props.context]);

  const statementNumber = props.number ? `${props.number}.${props.context?.Statements()?.length + 1}` : undefined;

  return (
    <div
      className={cn(
        "occurrence min-h-6 shadow-occurrence border-skin-occurrence bg-skin-occurrence rounded-sm border-2 relative left-full w-[15px] mt-[-2px] pl-[6px]",
        { "right-to-left left-[-14px]": props.rtl },
        props.className,
      )}
      data-el-type="occurrence"
      data-belongs-to={props.participant}
      data-x-offset={0}
      data-debug-center-of={computedCenter()}
    >
      {debug && (
        <>
          <div className="absolute w-full left-0 bg-amber-700 h-3 -top-1 flex justify-center items-center">
            <div className="w-px h-full bg-black"></div>
          </div>
          <div className="absolute w-full left-0 bg-amber-700 h-3 -bottom-1 flex justify-center items-center">
            <div className="w-px h-full bg-black"></div>
          </div>
        </>
      )}
      {hasAnyStatementsExceptReturn() && (
        <CollapseButton collapsed={collapsed} onClick={toggle} />
      )}
      {props.context.braceBlock() && (
        <Block
          origin={props.participant}
          context={props.context.braceBlock().block()}
          number={props.number}
          collapsed={collapsed}
        ></Block>
      )}
      {/* Render return statement for non-self sync message and creation */}
      {assigneeData && !props.isSelf && (
        <div className={cn("statement-container my-4")}>
          <div className={cn("interaction return relative right-to-left text-left text-sm text-skin-message")}>
            <Message
              className={cn(
                "return transform -translate-y-full pointer-events-auto",
                props.messageClassNames,
              )}
              context={props.context}
              labelPosition={assigneeData.labelPosition}
              content={assigneeData.content}
              rtl={!props.rtl}
              type="return"
              number={statementNumber}
              textStyle={props.textStyle}
              style={
                props.interactionWidth !== undefined
                  ? { width: `${props.interactionWidth}px`, transform: props.rtl ? `translateX(7px)` : `translateX(calc(-100% - 7px))` }
                  : undefined
              }
              normalizeText={syncMessageNormalizer}
            />
          </div>
        </div>
      )}
    </div>
  );
};
