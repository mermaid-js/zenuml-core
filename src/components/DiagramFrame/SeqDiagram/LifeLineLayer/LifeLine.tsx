import {
  coordinatesAtom,
  diagramElementAtom,
  lifelineReadyAtom,
  scaleAtom,
  verticalCoordinatesAtom,
} from "@/store/Store";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import parentLogger from "@/logger/logger";
import { cn } from "@/utils";
import { Participant } from "./Participant";
import { centerOf } from "../MessageLayer/Block/Statement/utils";
import { _STARTER_ } from "@/parser/OrderedParticipants";

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
  const diagramElement = useAtomValue(diagramElementAtom);
  const scale = useAtomValue(scaleAtom);
  const verticalCoordinates = useAtomValue(verticalCoordinatesAtom);
  const setLifelineReady = useSetAtom(lifelineReadyAtom);
  const PARTICIPANT_TOP_SPACE_FOR_GROUP = 20;
  const [top, setTop] = useState(PARTICIPANT_TOP_SPACE_FOR_GROUP);

  const left =
    centerOf(coordinates, props.entity.name) - (props.groupLeft || 0);

  const measureDomTop = useCallback(() => {
    if (!diagramElement) return null;
    const escapedName = props.entity.name.replace(
      /([ #;&,.+*~\':"!^$[\]()=>|\/@])/g,
      "\\$1",
    );
    const firstMessage = diagramElement.querySelector(
      `[data-type="creation"][data-to="${escapedName}"]`,
    ) as HTMLElement | null;
    if (!firstMessage || firstMessage.offsetParent == null) {
      return null;
    }
    const rootY = elRef.current?.getBoundingClientRect().y || 0;
    const messageY = firstMessage.getBoundingClientRect().y;
    const scaleValue = scale || 1;
    if (scaleValue === 0) return null;
    return (messageY - rootY) / scaleValue;
  }, [diagramElement, scale, props.entity.name]);

  useEffect(() => {
    if (!verticalCoordinates) {
      return;
    }
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
    const domTop = measureDomTop();
    if (domTop != null) {
      setTop(domTop);
    } else {
      setTop(resolvedTop);
      if (creationTop != null) {
        setTimeout(() => {
          const retry = measureDomTop();
          if (retry != null) {
            setTop(retry);
          }
        }, 0);
      }
    }
    if (props.entity.name !== _STARTER_) {
      setLifelineReady((prev) =>
        prev.includes(props.entity.name) ? prev : [...prev, props.entity.name],
      );
    }
  }, [props.entity.name, verticalCoordinates, setLifelineReady, measureDomTop]);

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
