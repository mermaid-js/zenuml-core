import { useEffect, useMemo, useState } from "react";
import { Block } from "./Block/Block";
import { centerOf } from "./Block/Statement/utils";
import { StylePanel } from "./StylePanel";
import { useAtomValue } from "jotai";
import { coordinatesAtom, messagesModelAtom } from "@/store/Store";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import "./MessageLayer.scss";

import parentLogger from "../../../../logger/logger";

const logger = parentLogger.child({ name: "MessageLayer" });
export const MessageLayer = (props: {
  context: any;
  style?: React.CSSProperties;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);
  const messagesModel = useAtomValue(messagesModelAtom);

  const origin = useMemo(() => {
    return messagesModel.length > 0 ? messagesModel[0].from || _STARTER_ : _STARTER_;
  }, [messagesModel]);

  const paddingLeft = centerOf(coordinates, origin) + 1;

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
        context={props.context}
        style={{ paddingLeft: `${paddingLeft}px` }}
        origin={origin}
      />
      <StylePanel />
    </div>
  );
};
