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
  selectedMessageAtom,
} from "@/store/Store";
import { createSyncMessageInDsl } from "@/utils/messageCreateTransform";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";

const HANDLE_TOP = 54;

export const MessageCreateControls = () => {
  const mode = useAtomValue(modeAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);
  const [, setSelectedParticipants] = useAtom(selectedAtom);
  const setSelectedMessage = useSetAtom(selectedMessageAtom);
  const [code, setCode] = useAtom(codeAtom);
  const [dragState, setDragState] = useAtom(createMessageDragAtom);
  const dragStateRef = useRef<typeof dragState>(null);
  const dragHandledRef = useRef(false);

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
      return;
    }

    const rect = diagramElement.getBoundingClientRect();

    const onPointerMove = (event: PointerEvent) => {
      const targetElement = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest("[data-participant-id]");
      const target = targetElement?.getAttribute("data-participant-id");

      setDragState((current) =>
        current
          ? {
              ...current,
              pointerX: event.clientX - rect.left,
              pointerY: event.clientY - rect.top,
              hoverTarget:
                target && target !== current.source ? target : null,
            }
          : current,
      );
    };

    const onPointerUp = (event: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current || dragHandledRef.current) {
        return;
      }
      dragHandledRef.current = true;
      const targetElement = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest("[data-participant-id]");
      const target = targetElement?.getAttribute("data-participant-id");
      if (target && target !== current.source) {
        const next = createSyncMessageInDsl({
          code,
          from: current.source,
          to: target,
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
  }, [code, diagramElement, dragState, onContentChange, setCode, setPendingEditableRange, setDragState, setSelectedParticipants]);

  if (mode !== RenderMode.Dynamic || !diagramElement || participants.length === 0) {
    return null;
  }

  const diagramRect = diagramElement.getBoundingClientRect();

  return (
    <>
      {participants.map((participant) => {
        const element = diagramElement.querySelector(
          `[data-participant-id="${participant.name}"]`,
        ) as HTMLElement | null;
        if (!element) {
          return null;
        }
        const rect = element.getBoundingClientRect();
        const left = rect.right - diagramRect.left + 6;
        return (
          <button
            key={participant.name}
            type="button"
            data-testid={`message-create-handle-${participant.name}`}
            title="Drag to create message"
            className="absolute z-40 h-8 w-8 rounded-full border border-sky-300 bg-white text-sky-600 shadow-sm hover:bg-sky-50 opacity-45 hover:opacity-100"
            style={{
              left,
              top: HANDLE_TOP,
              pointerEvents: "auto",
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              dragHandledRef.current = false;
              setSelectedMessage(null);
              setSelectedParticipants([participant.name]);
              const sourceX = rect.right - diagramRect.left;
              const sourceY = rect.top - diagramRect.top + rect.height / 2;
              setDragState({
                source: participant.name,
                sourceX,
                sourceY,
                pointerX: sourceX,
                pointerY: sourceY,
                hoverTarget: null,
              });
            }}
          >
            →
          </button>
        );
      })}
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
