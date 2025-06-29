import { useDocumentEvent } from "@/functions/useDocumentEvent";
import { dragParticipantAtom } from "@/store/Store";
import { useAtom } from "jotai";
import { useRef, useState } from "react";

export const DragLine = () => {
  const [position, setPosition] = useState([0, 0]);
  const [dragParticipant, setDragParticipant] = useAtom(dragParticipantAtom);
  const elRef = useRef<SVGSVGElement>(null);

  useDocumentEvent("mousemove", (e) => {
    const diagramRect = elRef.current?.getBoundingClientRect();
    if (!diagramRect) return;
    if (dragParticipant) {
      setPosition([e.clientX - diagramRect.left, e.clientY - diagramRect.top]);
    }
  });
  useDocumentEvent("mouseup", () => {
    if (dragParticipant) {
      setDragParticipant(undefined);
      setPosition([0, 0]);
    }
  });

  if (!dragParticipant) return null;
  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      ref={elRef}
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
    </svg>
  );
};
