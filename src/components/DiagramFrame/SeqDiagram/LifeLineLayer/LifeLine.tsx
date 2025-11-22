import {
  coordinatesAtom,
  lifelineReadyAtom,
  verticalCoordinatesAtom,
  verticalModeAtom,
  themeAtom,
} from "@/store/Store";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import parentLogger from "@/logger/logger";
import { cn } from "@/utils";
import { Participant } from "./Participant";
import { centerOf } from "../MessageLayer/Block/Statement/utils";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { getLayoutMetrics } from "@/positioning/vertical/LayoutMetrics";

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
  const theme = useAtomValue(themeAtom);
  const setLifelineReady = useSetAtom(lifelineReadyAtom);
  const PARTICIPANT_TOP_SPACE_FOR_GROUP = 20;
  const [top, setTop] = useState(PARTICIPANT_TOP_SPACE_FOR_GROUP);
  const left =
    centerOf(coordinates, props.entity.name) - (props.groupLeft || 0);
  console.log("verticalMode: ", verticalMode);

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
        };
      }
      setTop(resolvedTop);
      return true;
    };

    const resolveFromBrowser = () => {
      if (typeof window === "undefined") return false;
      const messageLayer = document.querySelector(
        ".message-layer",
      ) as HTMLElement | null;
      if (!messageLayer) return false;
      const messageLayerTop = messageLayer.getBoundingClientRect().top;
      const lifelinePadding = getLayoutMetrics(theme).lifelineLayerPaddingTop;
      const creations = Array.from(
        document.querySelectorAll(
          `[data-type="creation"][data-to="${props.entity.name}"]`,
        ) as NodeListOf<HTMLElement>,
      );
      if (!creations.length) return false;
      const earliest = Math.min(
        ...creations.map(
          (el) => el.getBoundingClientRect().top - messageLayerTop,
        ),
      );
      const resolvedTop = Math.max(
        PARTICIPANT_TOP_SPACE_FOR_GROUP,
        earliest - lifelinePadding,
      );
      setTop(resolvedTop);
      return true;
    };

    const resolved =
      verticalMode === "server" ? resolveFromServer() : resolveFromBrowser();
    if (resolved && props.entity.name !== _STARTER_) {
      setLifelineReady((prev) =>
        prev.includes(props.entity.name) ? prev : [...prev, props.entity.name],
      );
    }
  }, [
    props.entity.name,
    verticalCoordinates,
    verticalMode,
    setLifelineReady,
    theme,
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
