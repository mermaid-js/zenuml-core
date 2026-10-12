import { Participants } from "@/parser";
import { LifeLine } from "./LifeLine";
import { useAtomValue } from "jotai";
import { coordinatesAtom, diagramElementAtom } from "@/store/Store";
import { useRef, useState, useLayoutEffect, useCallback } from "react";

// Constants — match SVG renderer's group.ts stroke model
const LIFELINE_GROUP_OUTLINE_MARGIN = 2;
const GROUP_STROKE_WIDTH = 1;
const GROUP_SW2 = GROUP_STROKE_WIDTH / 2; // 0.5
const GROUP_STROKE_COLOR = "#666";
const GROUP_DASH_ARRAY = "4 3";
const GROUP_TITLE_LINE_HEIGHT = 19;

// Must match SVG renderer's GROUP_OUTLINE_MARGIN (buildParticipantGeometry.ts)
const SVG_GROUP_OUTLINE_MARGIN = 2;

const GroupOutline = (props: {
  left: number;
  top: number;
  width: number;
  height: number;
}) => (
  <svg
    data-group-overlay=""
    width={props.width}
    height={props.height}
    viewBox={`0 0 ${props.width} ${props.height}`}
    style={{
      position: "absolute",
      top: props.top,
      left: props.left,
      pointerEvents: "none",
      overflow: "visible",
      // The bottom edge runs into the frame's bottom border, as in the SVG
      // renderer. The lower half of the centred bottom stroke would paint
      // half a pixel below the frame and thicken its border under each dash,
      // so clip at the outline's own bottom edge. The rect keeps its size so
      // the dash pattern on the other edges is unchanged.
      // (tests/regression/group-outline-bottom.spec.ts)
      clipPath: `inset(-${GROUP_STROKE_WIDTH * 2}px -${GROUP_STROKE_WIDTH * 2}px 0 -${GROUP_STROKE_WIDTH * 2}px)`,
    }}
  >
    <rect
      x="0"
      y="0"
      width={props.width}
      height={props.height}
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
      // Hidden diagram (e.g. workbench SVG tab): boxes measure 0 wide.
      // Keep the last good measurement; ResizeObserver re-measures on show.
      if (r.width === 0) return;
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
    // Relative to the container top, this should be -0.5px for sw=1,
    // so the top border sits above the title chip rather than under it.
    const outlineTop = -GROUP_SW2;
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
    // Re-measure when the diagram is resized or goes from hidden to shown.
    const el = containerRef.current;
    const observer =
      el && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measureOverlay())
        : null;
    if (el && observer) observer.observe(el);
    return () => {
      cancelAnimationFrame(id);
      observer?.disconnect();
    };
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
        // Centre on the measured outline (rendered participant boxes), not the
        // container: the container uses layout-model widths, which can differ
        // from the rendered boxes (e.g. @Actor), and the SVG renderer centres
        // on the rendered boxes.
        // Fixed font-size and line-height on the chip itself: with the inherited
        // 16px font and line-height "normal", the line box depends on font
        // metrics and baseline alignment, and the opaque chip can grow taller
        // than the 20px above the participant boxes, hiding their top border.
        // 19px matches the SVG title bar (group.ts).
        // The opaque chip starts below the outline's top stroke (which spans
        // -GROUP_SW2..+GROUP_SW2 around the container top) so it does not hide
        // the stroke's lower half, like the SVG title bar (tbY = rectY + sw2).
        <div
          className="z-10 absolute left-1/2 -translate-x-1/2 bg-skin-frame px-1"
          style={{
            top: `${GROUP_SW2}px`,
            fontSize: "13px",
            lineHeight: `${GROUP_TITLE_LINE_HEIGHT}px`,
            ...(overlayRect
              ? { left: `${overlayRect.left + overlayRect.width / 2}px` }
              : {}),
          }}
        >
          <span className="text-skin-lifeline-group-name" style={{ fontSize: '13px', fontWeight: 400 }}>
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
