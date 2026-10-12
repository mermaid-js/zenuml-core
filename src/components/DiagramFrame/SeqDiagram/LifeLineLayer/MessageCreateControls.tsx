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
import { useEffect, useId, useMemo, useRef } from "react";

const DRAG_THRESHOLD = 6;

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
  const isCreatingMessage = Boolean(dragState);
  const dragStateRef = useRef<typeof dragState>(null);
  const dragHandledRef = useRef(false);
  const participantScreenXRef = useRef<Map<string, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const arrowId = useId();

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
    if (!diagramElement) return;
    if (isCreatingMessage && enabled && mode === RenderMode.Dynamic) {
      diagramElement.dataset.messageCreateDragging = "true";
    } else {
      delete diagramElement.dataset.messageCreateDragging;
    }
    return () => {
      delete diagramElement.dataset.messageCreateDragging;
    };
  }, [diagramElement, enabled, isCreatingMessage, mode]);

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

    const rect = diagramElement.getBoundingClientRect();
    const scale = rect.width / (diagramElement.offsetWidth || rect.width) || 1;
    const movedEnough = (
      clientX: number,
      clientY: number,
      sourceX: number,
      sourceY: number,
    ) =>
      Math.hypot(
        clientX - (rect.left + sourceX * scale),
        clientY - (rect.top + sourceY * scale),
      ) >= DRAG_THRESHOLD;

    const findTarget = (
      clientX: number,
      clientY: number,
      source: string,
    ): string | null => {
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      )
        return null;
      let nearest: string | null = null;
      let minDist = Infinity;
      for (const [name, cx] of participantScreenXRef.current) {
        const dist = Math.abs(clientX - cx);
        if (dist < minDist) {
          minDist = dist;
          nearest = name;
        }
      }
      if (!nearest || nearest === source) return null;
      const nearestX = participantScreenXRef.current.get(nearest)!;
      const neighborDistance = Math.min(
        ...Array.from(participantScreenXRef.current.values())
          .filter((x) => x !== nearestX)
          .map((x) => Math.abs(x - nearestX)),
      );
      if (minDist > Math.max(24 * scale, neighborDistance / 2)) return null;
      return nearest;
    };

    const onPointerMove = (event: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current) return;

      const target = movedEnough(
        event.clientX,
        event.clientY,
        current.sourceX,
        current.sourceY,
      )
        ? findTarget(event.clientX, event.clientY, current.source)
        : null;

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              pointerX: (event.clientX - rect.left) / scale,
              pointerY: (event.clientY - rect.top) / scale,
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

      const target = movedEnough(
        event.clientX,
        event.clientY,
        current.sourceX,
        current.sourceY,
      )
        ? findTarget(event.clientX, event.clientY, current.source)
        : null;
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
      dragStateRef.current = null;
      dragHandledRef.current = true;
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
  const scale =
    diagramRect.width / (diagramElement.offsetWidth || diagramRect.width) || 1;
  const containerRect = containerRef.current?.getBoundingClientRect();
  const offsetX = containerRect
    ? (containerRect.left - diagramRect.left) / scale
    : 0;
  const offsetY = containerRect
    ? (containerRect.top - diagramRect.top) / scale
    : 0;
  const targetElement = dragState?.hoverTarget
    ? (diagramElement.querySelector(
        `[data-participant-id="${CSS.escape(dragState.hoverTarget)}"]`,
      ) as HTMLElement | null)
    : null;
  const targetRect = targetElement?.getBoundingClientRect();
  const targetX = targetRect
    ? (targetRect.left + targetRect.width / 2 - diagramRect.left) / scale -
      offsetX
    : null;
  const tooltipX =
    targetX === null
      ? 0
      : Math.max(
          90,
          Math.min(
            targetX,
            (containerRef.current?.offsetWidth ?? diagramElement.offsetWidth) -
              90,
          ),
        );

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
            <defs>
              <marker
                id={arrowId}
                markerWidth="7"
                markerHeight="10"
                viewBox="0 0 7 9"
                markerUnits="userSpaceOnUse"
                refX="6.15"
                refY="4.5"
                orient="auto"
              >
                <path
                  d="M1 1.25 L6.15 4.5 L1 7.75"
                  fill="none"
                  stroke="#2563eb"
                  strokeLinecap="round"
                  strokeWidth="1"
                />
              </marker>
            </defs>
            <line
              data-testid="message-create-preview-line"
              x1={dragState.sourceX - offsetX}
              y1={dragState.sourceY - offsetY}
              x2={targetX ?? dragState.pointerX - offsetX}
              y2={dragState.sourceY - offsetY}
              stroke="#2563eb"
              strokeWidth="1"
              shapeRendering="crispEdges"
              markerEnd={`url(#${arrowId})`}
            />
          </svg>
          <div
            data-testid="message-create-source-dot"
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 pointer-events-none"
            style={{
              width: 6,
              height: 6,
              left: dragState.sourceX - offsetX,
              top: dragState.sourceY - offsetY,
            }}
            aria-hidden="true"
          />
        </>
      )}
      {dragState &&
        participants.map((participant) => {
          const isTarget = participant.name === dragState.hoverTarget;
          if (!isTarget) return null;
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
              className="absolute z-20 rounded-md border-2 border-blue-600 pointer-events-none"
              style={{
                left:
                  (rect.left - (containerRect?.left ?? diagramRect.left)) /
                    scale -
                  4,
                top:
                  (rect.top - (containerRect?.top ?? diagramRect.top)) / scale -
                  4,
                width: rect.width / scale + 8,
                height: rect.height / scale + 8,
              }}
            />
          );
        })}
      {dragState && targetRect && (
        <div
          data-testid="message-create-release-tooltip"
          className="absolute z-40 -translate-x-1/2 -translate-y-full rounded bg-gray-900 px-2 py-1 text-[11px] leading-4 text-white shadow-sm pointer-events-none"
          style={{
            left: tooltipX,
            top:
              (targetRect.top - (containerRect?.top ?? diagramRect.top)) /
                scale -
              8,
            width: "max-content",
            maxWidth: "min(180px, calc(100% - 16px))",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
          }}
        >
          Release to insert {dragState.source} → {dragState.hoverTarget}
        </div>
      )}
    </div>
  );
};
