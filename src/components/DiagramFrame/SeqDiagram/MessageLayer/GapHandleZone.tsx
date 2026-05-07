import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  codeAtom,
  coordinatesAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableDividerInsertionAtom,
  enableMessageInsertionAtom,
  modeAtom,
  onContentChangeAtom,
  pendingEditableRangeAtom,
  RenderMode,
  rootContextAtom,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { centerOf } from "./Block/Statement/utils";
import { insertDividerInDsl } from "@/utils/insertDividerInDsl";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GAP_HEIGHT_EMPTY = 48;
const HANDLE_SIZE = 16;
const GAP_OFFSET_UP = 5;

export const GapHandleZone = (props: {
  insertIndex: number;
  blockContext: any;
  origin: string;
  isEmpty?: boolean;
}) => {
  const mode = useAtomValue(modeAtom);
  const messageInsertionEnabled = useAtomValue(enableMessageInsertionAtom);
  const dividerInsertionEnabled = useAtomValue(enableDividerInsertionAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const dragState = useAtomValue(createMessageDragAtom);
  const setCreateDrag = useSetAtom(createMessageDragAtom);
  const setSelectedMessage = useSetAtom(selectedMessageAtom);
  const setSelectedParticipants = useSetAtom(selectedAtom);

  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);

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

  const insertDivider = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const result = insertDividerInDsl({
        code,
        blockContext: props.blockContext,
        insertIndex: props.insertIndex,
      });
      setCode(result.code);
      onContentChange(result.code);
      setPendingEditableRange({
        start: result.labelPosition[0],
        end: result.labelPosition[1],
        token: Date.now(),
      });
    },
    [code, onContentChange, props.blockContext, props.insertIndex, setCode, setPendingEditableRange],
  );

  if (
    mode !== RenderMode.Dynamic ||
    participants.length < 2 ||
    (!messageInsertionEnabled && !dividerInsertionEnabled)
  ) {
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

  function renderHandles() {
    return (
      <>
        <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-px border-t border-dashed border-amber-300/60" />
        {messageInsertionEnabled &&
          participants.map((p) => (
            <button
              key={p.name}
              type="button"
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400 bg-white text-amber-500 text-xs leading-none font-bold flex items-center justify-center cursor-grab hover:bg-amber-50 hover:border-amber-500 hover:shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              style={{
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                left: `${centerOf(coordinates, p.name)}px`,
                zIndex: 50,
                pointerEvents: "auto",
              }}
              data-testid={`message-create-handle-${props.insertIndex}-${p.name}`}
              title={`Drag to create a message from ${p.name}`}
              aria-label={`Drag to create a message from ${p.name}`}
              onPointerDown={(event) => startDrag(p.name, event)}
            >
              +
            </button>
          ))}
        {dividerInsertionEnabled && (
          <button
            type="button"
            className="absolute top-1/2 right-0 -translate-y-1/2 rounded border border-amber-400 bg-white text-amber-500 text-[9px] leading-none font-bold px-1 flex items-center justify-center hover:bg-amber-50 hover:border-amber-500 hover:shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            style={{
              height: HANDLE_SIZE,
              zIndex: 50,
              pointerEvents: "auto",
            }}
            data-testid={`divider-insert-${props.insertIndex}`}
            title="Insert divider"
            aria-label="Insert divider"
            onClick={insertDivider}
          >
            ══
          </button>
        )}
      </>
    );
  }

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
        data-testid={`message-gap-hover-${props.insertIndex}`}
        className="absolute left-0 right-0"
        style={{
          top: -(HANDLE_SIZE / 2) - GAP_OFFSET_UP,
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
