 import type React from "react";
import { Block } from "./Block/Block";
import { StylePanel } from "./StylePanel";
import { useAtomValue } from "jotai";
import { progVMAtom } from "@/store/Store";
import "./MessageLayer.scss";

export const MessageLayer = (props: {
  style?: React.CSSProperties;
}) => {
  const vm = useAtomValue(progVMAtom);

  return (
    <div
      className="message-layer relative z-30 pt-14 pb-10"
      style={props.style}
    >
      <Block vm={vm.rootBlockVM} style={{ paddingLeft: `${vm.paddingLeft}px` }} origin={vm.origin} />
      <StylePanel />
    </div>
  );
};
