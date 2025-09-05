import { useDocumentEvent } from "@/functions/useDocumentEvent";
import { dragAnchorAtom, dragParticipantAtom, scaleAtom } from "@/store/Store";
import { useAtom, useAtomValue } from "jotai";
import { useRef, useState } from "react";

export const DragLine = () => {
  const scale = useAtomValue(scaleAtom);
  const [position, setPosition] = useState([0, 0]);
  const [dragParticipant, setDragParticipant] = useAtom(dragParticipantAtom);
  const [dragAnchor, setDragAnchor] = useAtom(dragAnchorAtom);
  const elRef = useRef<SVGSVGElement>(null);

  useDocumentEvent("mousemove", (e) => {
    const diagramRect = elRef.current?.getBoundingClientRect();
    if (!diagramRect) return;
    if (dragParticipant || dragAnchor) {
      setPosition([
        (e.clientX - diagramRect.left) / scale,
        (e.clientY - diagramRect.top) / scale,
      ]);
    }
  });
  useDocumentEvent("mouseup", () => {
    if (dragParticipant) {
      setDragParticipant(undefined);
      setPosition([0, 0]);
    }
    if (dragAnchor) {
      setDragAnchor(undefined);
      setPosition([0, 0]);
    }
  });

  if (!dragParticipant && !dragAnchor) return null;
  return (
    <svg
      ref={elRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-30"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="7"
          refX="4"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 6 3.5, 0 7" fill="#0094D9" />
        </marker>
      </defs>
      {dragParticipant && (
        <line
          x1={dragParticipant.x}
          y1={dragParticipant.y}
          x2={position[0] || dragParticipant.x}
          y2={position[1] || dragParticipant.y}
          stroke="#0094D9"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          strokeDasharray="6,4"
        />
      )}
      {dragAnchor && (
        <line
          x1={dragAnchor.x}
          y1={dragAnchor.y}
          x2={position[0] || dragAnchor.x}
          y2={dragAnchor.y}
          stroke="#0094D9"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          strokeDasharray="6,4"
        />
      )}
    </svg>
  );
};
