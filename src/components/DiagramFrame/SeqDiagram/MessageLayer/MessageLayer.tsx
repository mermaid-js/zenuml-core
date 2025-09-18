import { useEffect, useMemo, useState } from "react";
import { Block } from "./Block/Block";
import { StylePanel } from "./StylePanel";
import { useAtomValue } from "jotai";
import { coordinatesAtom, messagesVMAtom } from "@/store/Store";
import "./MessageLayer.scss";
import { buildMessageLayerVM } from "@/vm/messageLayer";
import { buildBlockVM } from "@/vm/block";

import parentLogger from "../../../../logger/logger";

const logger = parentLogger.child({ name: "MessageLayer" });
export const MessageLayer = (props: {
  context: any;
  style?: React.CSSProperties;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);
  const messagesVM = useAtomValue(messagesVMAtom);

  const vm = useMemo(() => buildMessageLayerVM(messagesVM, coordinates), [messagesVM, coordinates]);

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
      <Block
        vm={buildBlockVM(props.context)}
        style={{ paddingLeft: `${vm.paddingLeft}px` }}
        origin={vm.origin}
      />
      <StylePanel />
    </div>
  );
};
