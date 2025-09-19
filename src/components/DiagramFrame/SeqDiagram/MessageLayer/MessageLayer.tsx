import { useEffect, useState } from "react";
import { Block } from "./Block/Block";
import { StylePanel } from "./StylePanel";
import { useAtomValue } from "jotai";
import { messageLayerVMAtom, blockVMAtom } from "@/store/Store";
import "./MessageLayer.scss";

import parentLogger from "../../../../logger/logger";

const logger = parentLogger.child({ name: "MessageLayer" });
export const MessageLayer = (props: {
  style?: React.CSSProperties;
}) => {
  const vm = useAtomValue(messageLayerVMAtom);
  const blockVM = useAtomValue(blockVMAtom);

  const [mounted, setMounted] = useState(false);
  if (mounted) {
    logger.debug("MessageLayer updated");
  }
  useEffect(() => {
    setMounted(true);
    logger.debug("MessageLayer mounted");
  }, []);

  return (
    <div
      className="message-layer relative z-30 pt-14 pb-10"
      style={props.style}
    >
      <Block vm={blockVM} style={{ paddingLeft: `${vm.paddingLeft}px` }} origin={vm.origin} />
      <StylePanel />
    </div>
  );
};
