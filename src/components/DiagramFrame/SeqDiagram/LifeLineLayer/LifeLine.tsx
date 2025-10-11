import { coordinatesAtom, participantMessagesAtom } from "@/store/Store";
import { useAtomValue } from "jotai";
import { useMemo, useRef } from "react";
import parentLogger from "@/logger/logger";
import { cn } from "@/utils";
import { Participant } from "./Participant";
import { centerOf } from "../MessageLayer/Block/Statement/utils";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import {
  CREATION_LIFELINE_OFFSET,
  PARTICIPANT_TOP_SPACE_FOR_GROUP,
} from "@/positioning/Constants";

const logger = parentLogger.child({ name: "LifeLine" });

export const LifeLine = (props: {
  entity: any;
  groupLeft?: any;
  renderParticipants?: boolean;
  renderLifeLine?: boolean;
  className?: string;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);
  const participantMessages = useAtomValue(participantMessagesAtom);

  const left =
    centerOf(coordinates, props.entity.name) - (props.groupLeft || 0);

  const top = useMemo(() => {
    const participantRecords = participantMessages[props.entity.name];
    if (!participantRecords || participantRecords.length === 0) {
      return PARTICIPANT_TOP_SPACE_FOR_GROUP;
    }

    const firstMessage = participantRecords[0];
    if (firstMessage?.type === "creation") {
      logger.debug(`First message to ${props.entity.name} is creation`);
      return firstMessage.top + CREATION_LIFELINE_OFFSET;
    }

    logger.debug(`First message to ${props.entity.name} is not creation`);
    return PARTICIPANT_TOP_SPACE_FOR_GROUP;
  }, [participantMessages, props.entity.name]);

  return (
    <div
      id={props.entity.name}
      entity-type={props.entity.type?.toLowerCase()}
      className={cn(
        "lifeline absolute flex flex-col h-full",
        {
          "transform -translate-x-1/2": props.renderParticipants,
        },
        props.className,
      )}
      style={{ paddingTop: top + "px", left: left + "px" }}
    >
      {props.renderParticipants && (
        <Participant entity={props.entity} offsetTop2={top} />
      )}
      {props.renderLifeLine && (
        <div className="line w0 mx-auto flex-grow w-px bg-[linear-gradient(to_bottom,transparent_50%,var(--color-border-base)_50%)] bg-[length:1px_10px]"></div>
      )}
    </div>
  );
};
