import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  codeAtom,
  diagramElementAtom,
  modeAtom,
  onContentChangeAtom,
  pendingEditableRangeAtom,
  RenderMode,
  rootContextAtom,
} from "@/store/Store";
import { createSyncMessageInDsl } from "@/utils/messageCreateTransform";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";

type DragState = {
  source: string;
  sourceX: number;
  sourceY: number;
  pointerX: number;
  pointerY: number;
};

const HANDLE_TOP = 54;

export const MessageCreateControls = () => {
  const mode = useAtomValue(modeAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
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
      setDragState((current) =>
        current
          ? {
              ...current,
              pointerX: event.clientX - rect.left,
              pointerY: event.clientY - rect.top,
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
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [code, diagramElement, dragState, onContentChange, setCode, setPendingEditableRange]);

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
            className="absolute z-40 h-6 w-6 rounded-full border border-sky-300 bg-white text-sky-600 shadow-sm hover:bg-sky-50"
            style={{
              left,
              top: HANDLE_TOP,
              pointerEvents: "auto",
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              dragHandledRef.current = false;
              const sourceX = rect.right - diagramRect.left;
              const sourceY = rect.top - diagramRect.top + rect.height / 2;
              setDragState({
                source: participant.name,
                sourceX,
                sourceY,
                pointerX: sourceX,
                pointerY: sourceY,
              });
            }}
          >
            •
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
    </>
  );
};
