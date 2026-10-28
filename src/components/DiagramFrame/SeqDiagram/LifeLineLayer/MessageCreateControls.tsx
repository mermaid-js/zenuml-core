import { useCommitCode } from "@/store/useCommitCode";
import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  codeAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableMessageInsertionAtom,
  pendingEditableRangeAtom,
  rootContextAtom,
  selectedAtom,
} from "@/store/Store";
import { useCan } from "@/store/interaction/useCan";
import { elementScale, rectToLocal } from "@/utils/diagramCoords";
import { insertMessageInDsl } from "@/utils/insertMessageInDsl";
import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { swallowFollowUps } from "@/store/interaction/swallowFollowUps";
import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { MessageTargetPicker } from "./MessageTargetPicker";

const DRAG_THRESHOLD = 6;

export const MessageCreateControls = () => {
  const store = useStore();
  const enabled = useAtomValue(enableMessageInsertionAtom);
  // ADR 0002: `createMessage` is allowed while a create drag runs and covers
  // the mode and the text-edit overlay.
  const canCreate = useCan("createMessage");
  const diagramElement = useAtomValue(diagramElementAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);
  const [, setSelectedParticipants] = useAtom(selectedAtom);
  const code = useAtomValue(codeAtom);
  const commitCode = useCommitCode();
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
  const participantNames = useMemo(
    () => participants.map((participant) => participant.name),
    [participants],
  );

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  // A drag that loses its capability (a text edit started) ends.
  useEffect(() => {
    if (!canCreate && dragState) setDragState(null);
  }, [canCreate, dragState, setDragState]);

  useEffect(() => {
    if (!diagramElement) return;
    if (isCreatingMessage && enabled && canCreate) {
      diagramElement.dataset.messageCreateDragging = "true";
    } else {
      delete diagramElement.dataset.messageCreateDragging;
    }
    return () => {
      delete diagramElement.dataset.messageCreateDragging;
    };
  }, [canCreate, diagramElement, enabled, isCreatingMessage]);

  // Insert the message the draft describes, sync by default, and open its
  // label for editing.
  const createTo = useCallback(
    (draft: NonNullable<typeof dragState>, target: string) => {
      const next = insertMessageInDsl({
        code,
        from: draft.source,
        to: target,
        blockContext: draft.blockContext,
        hostContext: draft.hostContext,
        insertIndex: draft.insertIndex,
      });
      commitCode(next.code, { action: "message_inserted" });
      setPendingEditableRange({
        start: next.labelPosition[0],
        end: next.labelPosition[1],
        token: Date.now(),
      });
    },
    [code, commitCode, setPendingEditableRange],
  );

  const closePicker = useCallback(
    (restoreFocus: boolean) => {
      const returnFocus = store.get(createMessageDragAtom)?.returnFocus;
      setDragState(null);
      setSelectedParticipants([]);
      if (restoreFocus) returnFocus?.focus();
    },
    [setDragState, setSelectedParticipants, store],
  );

  const pickTarget = useCallback(
    (target: string) => {
      const draft = store.get(createMessageDragAtom);
      if (!draft) return;
      createTo(draft, target);
      setDragState(null);
      setSelectedParticipants([]);
    },
    [createTo, setDragState, setSelectedParticipants, store],
  );

  // Picking: a press on a participant chooses it, a press in the picker is
  // the picker's own, and any other press cancels. Window capture runs
  // before the InteractionController's document listener.
  useEffect(() => {
    if (!dragState?.picking || !diagramElement || !canCreate) return;
    const participantAt = (target: EventTarget | null) => {
      const element =
        target instanceof Element
          ? target.closest<HTMLElement>("[data-participant-id]")
          : null;
      if (!element || !diagramElement.contains(element)) return null;
      const name = element.dataset.participantId;
      return name && participants.some((p) => p.name === name) ? name : null;
    };
    // The preview stays on the last participant pointed at, or on the
    // picker's active option, when the pointer leaves the participants.
    const onPointerMove = (event: PointerEvent) => {
      const target = participantAt(event.target);
      if (!target) return;
      setDragState((prev) =>
        prev && prev.pointedTarget !== target
          ? { ...prev, hoverTarget: target, pointedTarget: target }
          : prev,
      );
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('[data-interaction-surface="createDrag"]')
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      swallowFollowUps();
      const target = participantAt(event.target);
      if (target) pickTarget(target);
      else closePicker(false);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [
    canCreate,
    closePicker,
    diagramElement,
    dragState?.picking,
    participants,
    pickTarget,
    setDragState,
  ]);

  useEffect(() => {
    if (!dragState || dragState.picking || !diagramElement || !canCreate) {
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
    const scale = elementScale(diagramElement, rect);
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
      // Read the store, not this render: Escape can cancel the drag after
      // this listener was installed and before React re-renders.
      const current = store.get(createMessageDragAtom)
        ? dragStateRef.current
        : null;
      if (!current || dragHandledRef.current || !canCreate) {
        setDragState(null);
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
        createTo(current, target);
        setDragState(null);
        setSelectedParticipants([]);
        return;
      }
      // A click, or a release away from any participant, keeps the draft
      // and asks for the target: the design never guesses one.
      setDragState((prev) =>
        prev ? { ...prev, picking: true, hoverTarget: null } : prev,
      );
    };

    // Escape cancels through the interaction state (ADR 0002, P3): clearing
    // the drag removes these listeners before the pointer is released.
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    createTo,
    diagramElement,
    dragState,
    participants,
    setDragState,
    setSelectedParticipants,
    store,
    canCreate,
  ]);

  if (!enabled || !canCreate || !diagramElement || participants.length === 0) {
    return null;
  }

  const diagramRect = diagramElement.getBoundingClientRect();
  const scale = elementScale(diagramElement, diagramRect);
  const containerRect = containerRef.current?.getBoundingClientRect();
  const containerLocal = containerRect
    ? rectToLocal(diagramElement, containerRect)
    : null;
  const offsetX = containerLocal ? containerLocal.x : 0;
  const offsetY = containerLocal ? containerLocal.y : 0;
  const targetElement = dragState?.hoverTarget
    ? (diagramElement.querySelector(
        `[data-participant-id="${CSS.escape(dragState.hoverTarget)}"]`,
      ) as HTMLElement | null)
    : null;
  const targetRect = targetElement?.getBoundingClientRect();
  const targetX = targetRect
    ? rectToLocal(diagramElement, targetRect).centerX - offsetX
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
            {(!dragState.picking || targetX !== null) && (
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
            )}
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
              className="absolute z-20 rounded-zu-md border-2 border-blue-600 pointer-events-none"
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
      {dragState?.picking && (
        <MessageTargetPicker
          source={dragState.source}
          participants={participantNames}
          hovered={dragState.pointedTarget ?? null}
          left={dragState.sourceX - offsetX}
          top={dragState.sourceY - offsetY}
          onHover={(target: string | null) =>
            setDragState((prev) =>
              prev && prev.hoverTarget !== target
                ? { ...prev, hoverTarget: target }
                : prev,
            )
          }
          onPick={pickTarget}
          onCancel={() => closePicker(true)}
        />
      )}
      {dragState && !dragState.picking && targetRect && (
        <div
          data-testid="message-create-release-tooltip"
          className="absolute z-40 -translate-x-1/2 -translate-y-full rounded-zu-sm bg-gray-900 px-2 py-1 text-[11px] leading-4 text-white shadow-zu-sm pointer-events-none"
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
