import { coordinatesAtom, verticalCoordinatesAtom } from "@/store/Store";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils";
import { Participant } from "./Participant";
import { centerOf } from "../MessageLayer/Block/Statement/utils";

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
  const PARTICIPANT_TOP_SPACE_FOR_GROUP = 20;
  const [top, setTop] = useState(PARTICIPANT_TOP_SPACE_FOR_GROUP);
  const left =
    centerOf(coordinates, props.entity.name) - (props.groupLeft || 0);

  useEffect(() => {
    if (verticalCoordinates) {
      const creationTop = verticalCoordinates.getCreationTop(props.entity.name);
      const resolvedTop =
        creationTop != null
          ? Math.max(PARTICIPANT_TOP_SPACE_FOR_GROUP, creationTop)
          : PARTICIPANT_TOP_SPACE_FOR_GROUP;
      setTop(resolvedTop);
    }
  }, [props.entity.name, verticalCoordinates]);

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
