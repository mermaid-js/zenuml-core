import { Participants } from "@/parser";
import { LifeLine } from "./LifeLine";
import { useAtomValue } from "jotai";
import { coordinatesAtom, diagramElementAtom } from "@/store/Store";
import { useRef, useState, useLayoutEffect, useCallback } from "react";

// Constants — match SVG renderer's group.ts stroke model
const LIFELINE_GROUP_OUTLINE_MARGIN = 2;
const GROUP_STROKE_WIDTH = 1.5;
const GROUP_SW2 = GROUP_STROKE_WIDTH / 2; // 0.75
const GROUP_STROKE_COLOR = "#666";
const GROUP_DASH_ARRAY = "4 3";

// SVG renderer's GROUP_OUTLINE_MARGIN (buildParticipantGeometry.ts)
const SVG_GROUP_OUTLINE_MARGIN = 8;

const GroupOutline = (props: {
  left: number;
  top: number;
  width: number;
  height: number;
}) => (
  <svg
    data-group-overlay=""
    style={{
      position: "absolute",
      top: props.top,
      left: props.left,
      width: props.width,
      height: props.height,
      pointerEvents: "none",
      overflow: "visible",
    }}
  >
    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="none"
      stroke={GROUP_STROKE_COLOR}
      strokeWidth={GROUP_STROKE_WIDTH}
      strokeDasharray={GROUP_DASH_ARRAY}
    />
  </svg>
);

export const LifeLineGroup = (props: {
  context: any;
  renderParticipants: any;
  renderLifeLine: any;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const entities: any[] = Participants(props.context).Array();
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlayRect, setOverlayRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const entityNames = entities.map((e) => e.name);

  const measureOverlay = useCallback(() => {
    const el = containerRef.current;
    if (!el || !diagramElement || entityNames.length === 0) return;

    // Find participant boxes from the diagram root (they may be in a different layer)
    let minLeft = Infinity;
    let maxRight = -Infinity;
    for (const name of entityNames) {
      const escapedName = name.replace(/[^A-Za-z0-9_-]/g, "\\$&");
      const participantBox = diagramElement.querySelector(
        `#${escapedName} .participant`,
      ) as HTMLElement | null;
      if (!participantBox) continue;
      const r = participantBox.getBoundingClientRect();
      if (r.left < minLeft) minLeft = r.left;
      if (r.right > maxRight) maxRight = r.right;
    }

    if (!isFinite(minLeft) || !isFinite(maxRight)) return;

    // Convert to container-relative coordinates
    const containerRect = el.getBoundingClientRect();
    const relMinLeft = minLeft - containerRect.left;
    const relMaxRight = maxRight - containerRect.left;

    // Match SVG renderer's group outline:
    // SVG buildGroups: g.x = minLeft - 8, g.width = range + 16
    // SVG renderGroup: rectX = g.x - sw2, rectW = g.width + sw
    // So outline extends (SVG_GROUP_OUTLINE_MARGIN + sw2) beyond participant edges.
    const outlineLeft = relMinLeft - SVG_GROUP_OUTLINE_MARGIN - GROUP_SW2;
    const outlineRight = relMaxRight + SVG_GROUP_OUTLINE_MARGIN + GROUP_SW2;
    // SVG: rectY = g.y - sw - 0.5, where g.y = minY - 20 + 1.5
    // Relative to the container top, this is -sw2 + 0.25 = -0.5
    const outlineTop = -GROUP_SW2 + 0.25;
    const outlineHeight = containerRect.height + GROUP_STROKE_WIDTH;

    setOverlayRect((prev) => {
      const next = {
        left: outlineLeft,
        top: outlineTop,
        width: outlineRight - outlineLeft,
        height: outlineHeight,
      };
      if (
        prev &&
        prev.left === next.left &&
        prev.top === next.top &&
        prev.width === next.width &&
        prev.height === next.height
      ) {
        return prev;
      }
      return next;
    });
  }, [diagramElement, entityNames.join(",")]);

  useLayoutEffect(() => {
    // Defer to allow participant boxes to render in the other layer
    const id = requestAnimationFrame(measureOverlay);
    return () => cancelAnimationFrame(id);
  }, [measureOverlay]);

  if (entities.length <= 0) return null;
  // groupLeft is the logical position used for child lifeline positioning
  const groupLeft =
    coordinates.left(entities[0].name) + LIFELINE_GROUP_OUTLINE_MARGIN;
  const right =
    coordinates.right(entities[entities.length - 1].name) -
    LIFELINE_GROUP_OUTLINE_MARGIN;
  const name = props.context?.name()?.getFormattedText();
  return (
    <div
      ref={containerRef}
      className="lifeline-group-container absolute flex flex-col flex-grow h-full"
      style={{
        left: `${groupLeft}px`,
        width: `${right - groupLeft}px`,
      }}
    >
      {props.renderLifeLine && overlayRect && (
        <GroupOutline
          left={overlayRect.left}
          top={overlayRect.top}
          width={overlayRect.width}
          height={overlayRect.height}
        />
      )}
      {props.renderParticipants && name && (
        <div className="z-10 absolute flex items-center justify-center w-full bg-skin-frame">
          <span className="font-semibold text-skin-lifeline-group-name">
            {name}
          </span>
        </div>
      )}

      <div className="lifeline-group relative flex-grow">
        {entities.map((entity) => (
          <LifeLine
            key={entity.name}
            entity={entity}
            groupLeft={groupLeft}
            renderLifeLine={props.renderLifeLine}
            renderParticipants={props.renderParticipants}
          />
        ))}
      </div>
    </div>
  );
};
