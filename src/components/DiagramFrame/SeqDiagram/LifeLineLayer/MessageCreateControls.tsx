import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  codeAtom,
  createMessageDragAtom,
  diagramElementAtom,
  modeAtom,
  onContentChangeAtom,
  pendingEditableRangeAtom,
  RenderMode,
  rootContextAtom,
  selectedAtom,
} from "@/store/Store";
import { insertMessageInDsl } from "@/utils/insertMessageInDsl";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";

export const MessageCreateControls = () => {
  const mode = useAtomValue(modeAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);
  const [, setSelectedParticipants] = useAtom(selectedAtom);
  const [code, setCode] = useAtom(codeAtom);
  const [dragState, setDragState] = useAtom(createMessageDragAtom);
  const dragStateRef = useRef<typeof dragState>(null);
  const dragHandledRef = useRef(false);
  const participantScreenXRef = useRef<Map<string, number>>(new Map());

  const participants = useMemo(
    () =>
      OrderedParticipants(rootContext).filter(
        (participant) => participant.name !== _STARTER_,
      ),
    [rootContext],
  );

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    if (!dragState || !diagramElement) {
      dragHandledRef.current = false;
      participantScreenXRef.current = new Map();
      return;
    }

    if (participantScreenXRef.current.size === 0) {
      const map = new Map<string, number>();
      for (const p of participants) {
        const el = diagramElement.querySelector(
          `[data-participant-id="${p.name}"]`,
        ) as HTMLElement | null;
        if (el) {
          const rect = el.getBoundingClientRect();
          map.set(p.name, rect.left + rect.width / 2);
        }
      }
      participantScreenXRef.current = map;
    }

    const findNearest = (clientX: number, source: string): string | null => {
      let nearest: string | null = null;
      let minDist = Infinity;
      for (const [name, cx] of participantScreenXRef.current) {
        if (name === source) continue;
        const dist = Math.abs(clientX - cx);
        if (dist < minDist) {
          minDist = dist;
          nearest = name;
        }
      }
      return nearest;
    };

    const rect = diagramElement.getBoundingClientRect();

    const onPointerMove = (event: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current) return;

      const target = findNearest(event.clientX, current.source);

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              pointerX: event.clientX - rect.left,
              pointerY: event.clientY - rect.top,
              hoverTarget: target,
            }
          : prev,
      );
    };

    const onPointerUp = (event: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current || dragHandledRef.current) {
        return;
      }
      dragHandledRef.current = true;

      const target = findNearest(event.clientX, current.source);
      if (target) {
        const next = insertMessageInDsl({
          code,
          from: current.source,
          to: target,
          blockContext: current.blockContext,
          insertIndex: current.insertIndex,
        });
        setCode(next.code);
        onContentChange(next.code);
        setPendingEditableRange({
          start: next.labelPosition[0],
          end: next.labelPosition[1],
          token: Date.now(),
        });
      }
      setDragState(null);
      setSelectedParticipants([]);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setDragState(null);
      setSelectedParticipants([]);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [code, diagramElement, dragState, onContentChange, participants, setCode, setPendingEditableRange, setDragState, setSelectedParticipants]);

  if (mode !== RenderMode.Dynamic || !diagramElement || participants.length === 0) {
    return null;
  }

  const diagramRect = diagramElement.getBoundingClientRect();

  return (
    <>
      {dragState && (
        <svg
          className="absolute inset-0 z-30"
          style={{ pointerEvents: "none", overflow: "visible" }}
        >
          <line
            x1={dragState.sourceX}
            y1={dragState.sourceY}
            x2={dragState.pointerX}
            y2={dragState.pointerY}
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          <circle
            cx={dragState.pointerX}
            cy={dragState.pointerY}
            r="4"
            fill="#0284c7"
          />
        </svg>
      )}
      {dragState &&
        participants.map((participant) => {
          if (participant.name === dragState.source || participant.name !== dragState.hoverTarget) {
            return null;
          }
          const element = diagramElement.querySelector(
            `[data-participant-id="${participant.name}"]`,
          ) as HTMLElement | null;
          if (!element) {
            return null;
          }
          const rect = element.getBoundingClientRect();
          return (
            <div
              key={`highlight-${participant.name}`}
              data-testid={`message-create-target-${participant.name}`}
              className="absolute z-20 rounded-md border-2 border-sky-400 bg-sky-100/40 pointer-events-none"
              style={{
                left: rect.left - diagramRect.left - 4,
                top: rect.top - diagramRect.top - 4,
                width: rect.width + 8,
                height: rect.height + 8,
              }}
            />
          );
        })}
    </>
  );
};
