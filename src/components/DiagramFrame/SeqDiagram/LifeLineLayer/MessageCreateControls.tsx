import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  codeAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableMessageInsertionAtom,
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

const DRAG_HANDLE_SIZE = 16;

export const MessageCreateControls = () => {
  const mode = useAtomValue(modeAtom);
  const enabled = useAtomValue(enableMessageInsertionAtom);
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
  const containerRef = useRef<HTMLDivElement>(null);

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
          hostContext: current.hostContext,
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
  }, [
    code,
    diagramElement,
    dragState,
    onContentChange,
    participants,
    setCode,
    setPendingEditableRange,
    setDragState,
    setSelectedParticipants,
  ]);

  if (
    !enabled ||
    mode !== RenderMode.Dynamic ||
    !diagramElement ||
    participants.length === 0
  ) {
    return null;
  }

  const diagramRect = diagramElement.getBoundingClientRect();
  const containerRect = containerRef.current?.getBoundingClientRect();
  const offsetX = containerRect ? containerRect.left - diagramRect.left : 0;
  const offsetY = containerRect ? containerRect.top - diagramRect.top : 0;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ pointerEvents: "none" }}
    >
      {dragState && (
        <>
          <svg
            className="absolute inset-0 z-30"
            style={{ pointerEvents: "none", overflow: "visible" }}
          >
            <line
              x1={dragState.sourceX}
              y1={dragState.sourceY - offsetY}
              x2={dragState.pointerX - offsetX}
              y2={dragState.sourceY - offsetY}
              stroke="#d97706"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          </svg>
          <div
            data-testid="message-create-drag-indicator"
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400 bg-white text-amber-500 text-xs leading-none font-bold flex items-center justify-center shadow-sm pointer-events-none"
            style={{
              width: DRAG_HANDLE_SIZE,
              height: DRAG_HANDLE_SIZE,
              left: dragState.pointerX - offsetX,
              top: dragState.sourceY - offsetY,
            }}
            aria-hidden="true"
          >
            +
          </div>
        </>
      )}
      {dragState &&
        participants.map((participant) => {
          const isSource = participant.name === dragState.source;
          const isTarget = participant.name === dragState.hoverTarget;
          if (!isSource && !isTarget) return null;
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
              data-testid={
                isTarget
                  ? `message-create-target-${participant.name}`
                  : undefined
              }
              className={
                isTarget
                  ? "absolute z-20 rounded-md border-2 border-amber-400 bg-amber-100/40 pointer-events-none"
                  : "absolute z-20 rounded-md border-2 border-sky-400 bg-sky-100/40 pointer-events-none"
              }
              style={{
                left: rect.left - (containerRect?.left ?? diagramRect.left) - 4,
                top: rect.top - (containerRect?.top ?? diagramRect.top) - 4,
                width: rect.width + 8,
                height: rect.height + 8,
              }}
            />
          );
        })}
    </div>
  );
};
