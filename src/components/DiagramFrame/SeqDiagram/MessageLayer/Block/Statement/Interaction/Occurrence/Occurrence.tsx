import { CollapseButton } from "./CollapseButton";
import { EventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import { cn } from "@/utils";
import { Block } from "../../../Block";

export const Occurrence = (props: {
  number?: string;
  className?: string;
  vm: any;
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const debug = localStorage.getItem("zenumlDebug");
  const vm = props.vm;
  const toggle = () => {
    setCollapsed(!collapsed);
    //update participant top in this cases: has child and sibling creation statement
    //e.g. : a.call() { b = new B(); b.call() { c = new C() c.call(){return}}}
    EventBus.emit("participant_set_top");
  };

  useEffect(() => {
    setCollapsed(false);
  }, [vm]);

  return (
    <div
      className={cn(
        "occurrence min-h-6 shadow-occurrence border-skin-occurrence bg-skin-occurrence rounded-sm border-2 relative left-full w-[15px] mt-[-2px] pl-[6px]",
        props.className,
      )}
      data-el-type="occurrence"
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
      {vm.hasNonReturnStatements && (
        <CollapseButton collapsed={collapsed} onClick={toggle} />
      )}
      {vm && (
        <Block
          vm={vm}
          number={props.number}
          collapsed={collapsed}
        ></Block>
      )}
    </div>
  );
};
