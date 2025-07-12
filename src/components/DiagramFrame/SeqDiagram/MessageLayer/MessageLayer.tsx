import { useEffect, useMemo, useState } from "react";
import { Block } from "./Block/Block";
import { centerOf } from "./Block/Statement/utils";
import { StylePanel } from "./StylePanel";
import { useAtomValue } from "jotai";
import { rootContextAtom } from "@/store/Store";
import { AllMessages } from "@/parser/MessageCollector";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import "./MessageLayer.scss";

import parentLogger from "../../../../logger/logger";

const logger = parentLogger.child({ name: "MessageLayer" });
export const MessageLayer = (props: {
  context: any;
  style?: React.CSSProperties;
}) => {
  const rootContext = useAtomValue(rootContextAtom);

  const origin = useMemo(() => {
    const ownableMessages = AllMessages(rootContext);
    if (ownableMessages.length === 0) return _STARTER_;
    return ownableMessages[0].from || _STARTER_;
  }, [rootContext]);

  const paddingLeft = centerOf(origin) + 1;

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
      className="message-layer relative z-30 pt-14 pb-10 pointer-events-none"
      style={props.style}
    >
      <Block
        context={props.context}
        style={{ paddingLeft: `${paddingLeft}px` }}
        origin={origin}
      />
      <StylePanel />
    </div>
  );
};
