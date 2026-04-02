import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  coordinatesAtom,
  createMessageDragAtom,
  diagramElementAtom,
  modeAtom,
  RenderMode,
  rootContextAtom,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { centerOf } from "./Block/Statement/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GAP_HEIGHT_EMPTY = 48;
const HANDLE_SIZE = 24;

export const GapHandleZone = (props: {
  insertIndex: number;
  blockContext: any;
  origin: string;
  isEmpty?: boolean;
}) => {
  const mode = useAtomValue(modeAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const dragState = useAtomValue(createMessageDragAtom);
  const setCreateDrag = useSetAtom(createMessageDragAtom);
  const setSelectedMessage = useSetAtom(selectedMessageAtom);
  const setSelectedParticipants = useSetAtom(selectedAtom);

  const [hovered, setHovered] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handlePointerEnter = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (!dragState) setHovered(true);
  }, [dragState]);

  const handlePointerLeave = useCallback(() => {
    if (!dragState) {
      hideTimerRef.current = setTimeout(() => {
        setHovered(false);
        hideTimerRef.current = null;
      }, 80);
    }
  }, [dragState]);

  const participants = useMemo(
    () =>
      OrderedParticipants(rootContext).filter((p) => p.name !== _STARTER_),
    [rootContext],
  );

  const paddingLeft = centerOf(coordinates, props.origin) + 1;

  if (mode !== RenderMode.Dynamic || participants.length < 2) {
    return null;
  }

  const startDrag = (
    participantName: string,
    event: React.PointerEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!diagramElement) return;

    const diagramRect = diagramElement.getBoundingClientRect();
    const sourceX = centerOf(coordinates, participantName);
    const buttonEl = event.currentTarget as HTMLElement;
    const buttonRect = buttonEl.getBoundingClientRect();
    const sourceY = buttonRect.top - diagramRect.top + buttonRect.height / 2;

    setSelectedMessage(null);
    setSelectedParticipants([participantName]);
    setCreateDrag({
      source: participantName,
      sourceX,
      sourceY,
      pointerX: sourceX,
      pointerY: sourceY,
      hoverTarget: null,
      insertIndex: props.insertIndex,
      blockContext: props.blockContext,
    });
  };

  const showHandles = hovered && !dragState;

  if (props.isEmpty) {
    return (
      <div
        className="relative flex items-center"
        style={{
          height: GAP_HEIGHT_EMPTY,
          marginLeft: `-${paddingLeft}px`,
          width: `calc(100% + ${paddingLeft}px)`,
        }}
        data-testid={`message-gap-${props.insertIndex}`}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {showHandles && renderHandles()}
      </div>
    );
  }

  function renderHandles() {
    return (
      <>
        <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-px border-t border-dashed border-sky-300/60" />
        {participants.map((p) => (
          <button
            key={p.name}
            type="button"
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400 bg-white text-sky-600 shadow-sm text-sm font-bold flex items-center justify-center cursor-grab hover:bg-sky-50 hover:border-sky-500 hover:shadow-md transition-colors"
            style={{
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              left: `${centerOf(coordinates, p.name)}px`,
              zIndex: 50,
              pointerEvents: "auto",
            }}
            data-testid={`message-create-handle-${props.insertIndex}-${p.name}`}
            title={`Create message from ${p.name}`}
            onPointerDown={(event) => startDrag(p.name, event)}
          >
            +
          </button>
        ))}
      </>
    );
  }

  return (
    <div
      className="relative"
      style={{
        height: 0,
        marginLeft: `-${paddingLeft}px`,
        width: `calc(100% + ${paddingLeft}px)`,
        pointerEvents: "none",
      }}
      data-testid={`message-gap-${props.insertIndex}`}
    >
      {/* Hover zone tall enough to fully contain the handle buttons (no overflow),
         so pointerLeave never fires when moving between the zone and a button. */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: -(HANDLE_SIZE / 2),
          height: HANDLE_SIZE,
          pointerEvents: "auto",
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {showHandles && renderHandles()}
      </div>
    </div>
  );
};
