import { diagramElementAtom, scaleAtom } from "@/store/Store";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import parentLogger from "@/logger/logger";
import { EventBus } from "@/EventBus";
import { cn } from "@/utils";
import { Participant } from "./Participant";
import { getParticipantCenter } from "@/positioning/GeometryUtils";
import { diagramLayoutAtom } from "@/domain/DomainModelStore";

const logger = parentLogger.child({ name: "LifeLine" });

export const LifeLine = (props: {
  entity: any;
  groupLeft?: any;
  renderParticipants?: boolean;
  renderLifeLine?: boolean;
  className?: string;
}) => {
  const diagramLayout = useAtomValue(diagramLayoutAtom);
  const elRef = useRef<HTMLDivElement>(null);
  const scale = useAtomValue(scaleAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const PARTICIPANT_TOP_SPACE_FOR_GROUP = 20;
  const [top, setTop] = useState(PARTICIPANT_TOP_SPACE_FOR_GROUP);

  const left = getParticipantCenter(props.entity.name) - (props.groupLeft || 0);

  const updateTop = useCallback(() => {
    // escape entity name to avoid 'not a valid selector' error.
    const escapedName = props.entity.name.replace(
      // eslint-disable-next-line no-useless-escape
      /([ #;&,.+*~\':"!^$[\]()=>|\/@])/g,
      "\\$1",
    );
    const firstMessage = diagramElement?.querySelector(
      `[data-to="${escapedName}"]`,
    ) as any;
    const isVisible = firstMessage?.offsetParent != null;
    if (
      firstMessage &&
      firstMessage.attributes["data-type"]?.value === "creation" &&
      isVisible
    ) {
      logger.debug(`First message to ${props.entity.name} is creation`);
      const rootY = elRef.current?.getBoundingClientRect().y || 0;
      const messageY = firstMessage.getBoundingClientRect().y;
      setTop((messageY - rootY) / scale);
    } else {
      // A B.m {new A} => A B.m {new A1}
      logger.debug(`First message to ${props.entity.name} is not creation`);
      setTop(PARTICIPANT_TOP_SPACE_FOR_GROUP);
    }
  }, [diagramElement, props.entity.name, scale]);

  useEffect(() => {
    logger.debug(`LifeLine mounted/update for ${props.entity.name}`);
    setTimeout(() => {
      updateTop();
      logger.debug(`nextTick after updated for ${props.entity.name}`);
    }, 0);

    EventBus.on("participant_set_top", () => setTimeout(() => updateTop(), 0));
  }, [props.entity, updateTop]);

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
      ref={elRef}
    >
      {props.renderParticipants && (
        <Participant 
          entity={props.entity} 
          participantId={props.entity.name}
          offsetTop2={top} 
        />
      )}
      {props.renderLifeLine && (
        <div className="line w0 mx-auto flex-grow w-px bg-[linear-gradient(to_bottom,transparent_50%,var(--color-border-base)_50%)] bg-[length:1px_10px]"></div>
      )}
    </div>
  );
};
