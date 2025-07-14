import { CollapseButton } from "./CollapseButton";
import { EventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import { cn } from "@/utils";
import { Block } from "../../../Block";
import { getParticipantCenter } from "@/positioning/GeometryUtils";

export const Occurrence = (props: {
  context?: any;
  participant?: any;
  rtl?: boolean;
  number?: string;
  className?: string;
  layoutData?: {
    participantId: string;
    centerPosition: number;
    rtl?: boolean;
    hasStatements: boolean;
    collapsed: boolean;
    style?: React.CSSProperties;
  };
}) => {
  // Determine which architecture to use
  const isNewArchitecture = !!props.layoutData;
  
  // Always call hooks at top level to maintain hook order
  const [collapsed, setCollapsed] = useState(false);

  const debug = localStorage.getItem("zenumlDebug");

  const computedCenter = () => {
    if (isNewArchitecture) {
      return props.layoutData!.centerPosition;
    }
    try {
      return getParticipantCenter(props.participant);
    } catch (e) {
      console.error(e);
      return 0;
    }
  };
  
  const hasAnyStatementsExceptReturn = () => {
    if (isNewArchitecture) {
      return props.layoutData!.hasStatements;
    }
    const braceBlock = props.context?.braceBlock();
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

  // Extract unified data
  const participantId = isNewArchitecture ? props.layoutData!.participantId : props.participant;
  const isRtl = isNewArchitecture ? props.layoutData!.rtl : props.rtl;

  useEffect(() => {
    if (isNewArchitecture) {
      setCollapsed(props.layoutData!.collapsed);
    } else {
      setCollapsed(false);
    }
  }, [isNewArchitecture, props.layoutData, props.context]);

  return (
    <div
      className={cn(
        "occurrence min-h-6 shadow-occurrence border-skin-occurrence bg-skin-occurrence rounded-sm border-2 relative left-full w-[15px] mt-[-2px] pl-[6px]",
        { "right-to-left left-[-14px]": isRtl },
        props.className,
      )}
      data-el-type="occurrence"
      data-belongs-to={participantId}
      data-x-offset={0}
      data-debug-center-of={computedCenter()}
      style={isNewArchitecture ? props.layoutData!.style : undefined}
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
      {(isNewArchitecture ? props.layoutData!.hasStatements : props.context?.braceBlock()) && (
        <Block
          origin={participantId}
          context={isNewArchitecture ? undefined : props.context.braceBlock().block()}
          number={props.number}
          collapsed={collapsed}
        ></Block>
      )}
    </div>
  );
};
