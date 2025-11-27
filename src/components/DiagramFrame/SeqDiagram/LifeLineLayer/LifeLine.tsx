import {
  coordinatesAtom,
  lifelineReadyAtom,
  verticalCoordinatesAtom,
  verticalModeAtom,
  diagramElementAtom,
  scaleAtom,
} from "@/store/Store";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import parentLogger from "@/logger/logger";
import { cn } from "@/utils";
import { Participant } from "./Participant";
import { centerOf } from "../MessageLayer/Block/Statement/utils";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { EventBus } from "@/EventBus";

const logger = parentLogger.child({ name: "LifeLine" });

export const LifeLine = (props: {
  entity: any;
  groupLeft?: any;
  renderParticipants?: boolean;
  renderLifeLine?: boolean;
  className?: string;
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const coordinates = useAtomValue(coordinatesAtom);
  const verticalCoordinates = useAtomValue(verticalCoordinatesAtom);
  const verticalMode = useAtomValue(verticalModeAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const scale = useAtomValue(scaleAtom);
  const setLifelineReady = useSetAtom(lifelineReadyAtom);
  const PARTICIPANT_TOP_SPACE_FOR_GROUP = 20;
  const [top, setTop] = useState(PARTICIPANT_TOP_SPACE_FOR_GROUP);
  const left =
    centerOf(coordinates, props.entity.name) - (props.groupLeft || 0);

  const updateTopFromBrowser = useCallback(() => {
    // escape entity name to avoid invalid selector errors
    const escapedName = props.entity.name.replace(
      /([ #;&,.+*~':"!^$\[\]()=>|\/@])/g,
      "\\$1",
    );
    const firstMessage = diagramElement?.querySelector(
      `[data-to="${escapedName}"]`,
    ) as HTMLElement | null;
    const isVisible = firstMessage?.offsetParent != null;
    if (
      firstMessage &&
      firstMessage.getAttribute("data-type") === "creation" &&
      isVisible
    ) {
      const rootY = elRef.current?.getBoundingClientRect().y || 0;
      const messageY = firstMessage.getBoundingClientRect().y;
      setTop((messageY - rootY) / (scale || 1));
    } else {
      setTop(PARTICIPANT_TOP_SPACE_FOR_GROUP);
    }
  }, [diagramElement, props.entity.name, scale]);

  useEffect(() => {
    const resolveFromServer = () => {
      if (!verticalCoordinates) return false;
      const creationTop = verticalCoordinates.getCreationTop(props.entity.name);
      const lifelineLayerPaddingTop =
        verticalCoordinates.getLifelineLayerPaddingTop();
      const resolvedTop =
        creationTop != null
          ? Math.max(
              PARTICIPANT_TOP_SPACE_FOR_GROUP,
              creationTop - lifelineLayerPaddingTop,
            )
          : PARTICIPANT_TOP_SPACE_FOR_GROUP;
      logger.debug(
        `LifeLine top resolved for ${props.entity.name}: ${resolvedTop}px`,
      );
      if (
        typeof window !== "undefined" &&
        (window as any).__ZEN_CAPTURE_VERTICAL
      ) {
        (window as any).__zenumlVerticalEntries = verticalCoordinates.entries();
        const registry =
          (window as any).__zenumlLifelineDebug ||
          ((window as any).__zenumlLifelineDebug = {});
        registry[props.entity.name] = {
          creationTop,
          resolvedTop,
          lifelineLayerPaddingTop,
          components: verticalCoordinates.getCreationTopComponents(
            props.entity.name,
          ),
        };
        // Also export the full creation top records for all participants
        (window as any).__zenumlCreationTopRecords =
          verticalCoordinates.getCreationTopRecords();
      }
      setTop(resolvedTop);
      return true;
    };

    if (verticalMode === "server") {
      resolveFromServer();
    } else {
      const rerun = () => setTimeout(updateTopFromBrowser, 0);
      setTimeout(updateTopFromBrowser, 0);
      EventBus.on("participant_set_top", rerun);
      return () => EventBus.off("participant_set_top", rerun);
    }

    if (props.entity.name !== _STARTER_) {
      setTimeout(() => {
        setLifelineReady((prev) =>
          prev.includes(props.entity.name)
            ? prev
            : [...prev, props.entity.name],
        );
      }, 0);
    }
  }, [
    props.entity.name,
    verticalCoordinates,
    verticalMode,
    setLifelineReady,
    updateTopFromBrowser,
  ]);

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
      style={{ paddingTop: top + "px", left: left + "px", translate: 0 }}
      ref={elRef}
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
