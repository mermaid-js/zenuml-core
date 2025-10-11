import {
  diagramElementAtom,
  lifelineReadyAtom,
  scaleAtom,
} from "@/store/Store";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import parentLogger from "@/logger/logger";
import { EventBus } from "@/EventBus";
import { cn } from "@/utils";
import { Participant } from "./Participant";
import { _STARTER_ } from "@/constants";

const logger = parentLogger.child({ name: "LifeLine" });

export const LifeLine = (props: {
  vm?: any; // ParticipantVM when available
  groupLeft?: any;
  renderParticipants?: boolean;
  renderLifeLine?: boolean;
  className?: string;
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const scale = useAtomValue(scaleAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const setLifelineReady = useSetAtom(lifelineReadyAtom);
  const PARTICIPANT_TOP_SPACE_FOR_GROUP = 20;
  const [top, setTop] = useState(PARTICIPANT_TOP_SPACE_FOR_GROUP);

  // New approach: Use VM layout center when available
  const center = props.vm?.layout?.center;
  const left = center ? center - (props.groupLeft || 0) : null;

  const updateTop = useCallback(() => {
    const firstMessage = diagramElement?.querySelector(
      `[data-to="${props.vm?.name}"]`,
    ) as any;
    const isVisible = firstMessage?.offsetParent != null;
    if (
      firstMessage &&
      firstMessage.attributes["data-type"]?.value === "creation" &&
      isVisible
    ) {
      logger.debug(`First message to ${props.vm.name} is creation`);
      const rootY = elRef.current?.getBoundingClientRect().y || 0;
      const messageY = firstMessage.getBoundingClientRect().y;
      setTop((messageY - rootY) / scale);
    } else {
      // A B.m {new A} => A B.m {new A1}
      logger.debug(`First message to ${props.vm.name} is not creation`);
      setTop(PARTICIPANT_TOP_SPACE_FOR_GROUP);
    }
    if (props.vm.name !== _STARTER_) {
      setTimeout(() => {
        setLifelineReady((prev) =>
          prev.includes(props.vm.name)
            ? prev
            : [...prev, props.vm.name],
        );
      }, 0);
    }
  }, [diagramElement, props.vm.name, scale]);

  useEffect(() => {
    setTimeout(() => {
      updateTop();
    }, 0);

    EventBus.on("participant_set_top", () => setTimeout(() => updateTop(), 0));
  }, [props.vm, updateTop]);

  return (
    <div
      id={props.vm.name}
      entity-type={props.vm.type?.toLowerCase()}
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
      {props.renderParticipants && props.vm && (
        <Participant vm={props.vm} offsetTop2={top} />
      )}
      {props.renderLifeLine && (
        <div className="line w0 mx-auto flex-grow w-px bg-[linear-gradient(to_bottom,transparent_50%,var(--color-border-base)_50%)] bg-[length:1px_10px]"></div>
      )}
    </div>
  );
};
