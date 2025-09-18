import { CollapseButton } from "./CollapseButton";
import { EventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import { cn } from "@/utils";
import { Block } from "../../../Block";
import { buildBlockVM } from "@/vm/block";
import { buildOccurrenceVM, type OccurrenceVM } from "@/vm/occurrence";
import { centerOf } from "../../utils";
import { useAtomValue } from "jotai";
import { coordinatesAtom } from "@/store/Store";

export const Occurrence = (props: {
  context: any;
  participant: any;
  rtl?: boolean;
  number?: string;
  className?: string;
  vm?: OccurrenceVM;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);
  const [collapsed, setCollapsed] = useState(false);

  const debug = localStorage.getItem("zenumlDebug");

  // Calculate center position for VM building
  const centerPosition = (() => {
    try {
      return centerOf(coordinates, props.participant);
    } catch (e) {
      console.error(e);
      return 0;
    }
  })();

  // Build VM if not provided (fallback for transition period)
  const vm = props.vm || buildOccurrenceVM(props.context, props.participant, centerPosition, props.rtl);
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
        props.className,
      )}
      data-el-type="occurrence"
      data-belongs-to={props.participant}
      data-x-offset={0}
      data-debug-center-of={vm?.centerPosition || 0}
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
      {vm?.hasNonReturnStatements && (
        <CollapseButton collapsed={collapsed} onClick={toggle} />
      )}
      {vm?.blockContext && (
        <Block
          origin={props.participant}
          vm={buildBlockVM(vm.blockContext)}
          number={props.number}
          collapsed={collapsed}
        ></Block>
      )}
    </div>
  );
};
