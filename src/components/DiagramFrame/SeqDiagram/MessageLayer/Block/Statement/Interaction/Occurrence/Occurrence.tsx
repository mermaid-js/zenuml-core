import { CollapseButton } from "./CollapseButton";
import { EventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import { cn } from "@/utils";
import { Block } from "../../../Block";
import { centerOf } from "../../utils";
import { Anchor } from "../../../../Anchor";
import { useAtomValue } from "jotai";
import { dragAnchorAtom } from "@/store/Store";

export const Occurrence = (props: {
  context: any;
  participant: any;
  rtl?: boolean;
  number?: string;
  className?: string;
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const dragAnchor = useAtomValue(dragAnchorAtom);

  const debug = localStorage.getItem("zenumlDebug");

  const computedCenter = () => {
    try {
      return centerOf(props.participant);
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

  return (
    <div
      className={cn(
        "occurrence min-h-6 shadow-occurrence border-skin-occurrence bg-skin-occurrence rounded-sm border-2 relative left-full w-[15px] mt-[-2px] pl-[6px]",
        { "right-to-left left-[-14px]": props.rtl },
        dragAnchor ? "pointer-events-none" : "pointer-events-auto",
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
      {props.context.braceBlock() ? (
        <Block
          origin={props.participant}
          context={props.context.braceBlock().block()}
          number={props.number}
          collapsed={collapsed}
        ></Block>
      ) : (
        <Anchor context={props.context} participant={props.participant} />
      )}
    </div>
  );
};
