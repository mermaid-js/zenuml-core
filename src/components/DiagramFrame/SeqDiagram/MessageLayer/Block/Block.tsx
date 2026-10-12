import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  codeAtom,
  diagramElementAtom,
  enableMessageReorderAtom,
  messageReorderDragAtom,
  messageReorderDropAtom,
  messageReorderPendingAtom,
  modeAtom,
  onContentChangeAtom,
  RenderMode,
  selectedAtom,
  selectedMessageAtom,
  textEditingAtom,
} from "@/store/Store";
import { reorderMessageInDsl } from "@/utils/messageReorderTransform";
import { Fragment, useEffect, useRef } from "react";
import { GapHandleZone } from "../GapHandleZone";

const DRAG_THRESHOLD = 4;

export const Block = (props: {
  origin?: string;
  context?: any;
  number?: string;
  incremental?: boolean;
  collapsed?: boolean;
  style?: React.CSSProperties;
  className?: string;
  enableGapHandles?: boolean;
  isRoot?: boolean;
}) => {
  const [code, setCode] = useAtom(codeAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const statements: any[] = props.context?.stat() || [];
  const enableGapHandles = props.enableGapHandles ?? false;
  const [dragKey, setDragKey] = useAtom(messageReorderDragAtom);
  const dragKeyRef = useRef<string | null>(null);
  const [pendingDrag, setPendingDrag] = useAtom(messageReorderPendingAtom);
  const [dropState, setDropState] = useAtom(messageReorderDropAtom);
  const enableMessageReorder = useAtomValue(enableMessageReorderAtom);
  const mode = useAtomValue(modeAtom);
  const textEditing = useAtomValue(textEditingAtom);
  const setSelectedMessage = useSetAtom(selectedMessageAtom);
  const setSelectedParticipants = useSetAtom(selectedAtom);
  // Unlike every other editing surface, this drag used to run with no
  // `enable*` flag and no respect for `RenderMode.Static` — a render-only
  // host (SVG export, a static embed) could have its diagram silently
  // rewritten by an accidental drag.
  const reorderEnabled =
    enableMessageReorder && !textEditing && mode === RenderMode.Dynamic;

  useEffect(() => {
    if (!textEditing) return;
    setPendingDrag(null);
    setDragKey(null);
    setDropState(null);
  }, [setDragKey, setDropState, setPendingDrag, textEditing]);

  useEffect(() => {
    dragKeyRef.current = dragKey;
  }, [dragKey]);

  useEffect(() => {
    if (!props.isRoot || (!pendingDrag && !dragKey)) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "grabbing";

    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [dragKey, pendingDrag, props.isRoot]);

  useEffect(() => {
    if (!props.isRoot || !reorderEnabled) {
      return;
    }
    if (!pendingDrag || dragKey) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const deltaX = Math.abs(event.clientX - pendingDrag.startX);
      const deltaY = Math.abs(event.clientY - pendingDrag.startY);
      if (Math.max(deltaX, deltaY) < DRAG_THRESHOLD) {
        return;
      }
      if (event.pointerType === "touch") {
        const hit = document.elementFromPoint(event.clientX, event.clientY);
        const row = diagramElement?.contains(hit)
          ? (hit?.closest(
              ".statement-container[data-statement-key]",
            ) as HTMLElement | null)
          : null;
        const key = row?.getAttribute("data-statement-key");
        if (key && key !== pendingDrag.key) {
          const rect = row!.getBoundingClientRect();
          setDropState({
            key,
            place:
              event.clientY < rect.top + rect.height / 2 ? "before" : "after",
          });
        }
      }
      setDragKey(pendingDrag.key);
      setPendingDrag(null);
    };

    const onPointerUp = () => {
      setPendingDrag(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    diagramElement,
    dragKey,
    pendingDrag,
    props.isRoot,
    reorderEnabled,
    setDragKey,
    setDropState,
    setPendingDrag,
  ]);

  useEffect(() => {
    if (!props.isRoot) {
      return;
    }
    if (!dragKey) {
      return;
    }
    const onPointerMove = (event: PointerEvent) => {
      // Touch implicitly captures pointer events on the handle, so event.target
      // stays on that handle even while the finger crosses another message.
      const hit =
        event.pointerType === "touch"
          ? document.elementFromPoint(event.clientX, event.clientY)
          : (event.target as Element | null);
      const target =
        event.pointerType === "touch" && !diagramElement?.contains(hit)
          ? null
          : hit;
      const hoveredRow = target?.closest?.(
        ".statement-container[data-statement-key]",
      ) as HTMLElement | null;
      const hoveredKey = hoveredRow?.getAttribute("data-statement-key");
      if (!hoveredKey || hoveredKey === dragKey) {
        setDropState(null);
      } else if (event.pointerType === "touch" && hoveredRow) {
        const rect = hoveredRow.getBoundingClientRect();
        setDropState({
          key: hoveredKey,
          place:
            event.clientY < rect.top + rect.height / 2 ? "before" : "after",
        });
      }
    };
    const onPointerUp = () => {
      const sourceKey = dragKeyRef.current;
      if (
        !reorderEnabled ||
        !sourceKey ||
        !dropState ||
        dropState.key === sourceKey
      ) {
        setDragKey(null);
        setDropState(null);
        return;
      }
      const [sourceStart, sourceEnd] = sourceKey.split("-").map(Number);
      const [targetStart, targetEnd] = dropState.key.split("-").map(Number);
      const nextCode = reorderMessageInDsl({
        code,
        sourceRange: [sourceStart, sourceEnd],
        targetRange: [targetStart, targetEnd],
        place: dropState.place,
      });
      setCode(nextCode);
      onContentChange(nextCode);
      setDragKey(null);
      setDropState(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    code,
    diagramElement,
    dragKey,
    dropState,
    onContentChange,
    props.isRoot,
    reorderEnabled,
    setCode,
    setDragKey,
    setDropState,
  ]);

  useEffect(() => {
    if (!props.isRoot || (!pendingDrag && !dragKey)) return;
    const cancel = () => {
      setPendingDrag(null);
      setDragKey(null);
      setDropState(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel();
    };
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    dragKey,
    pendingDrag,
    props.isRoot,
    setDragKey,
    setDropState,
    setPendingDrag,
  ]);

  const getNumber = (index: number) => {
    if (props.number) {
      return props.incremental
        ? increaseNumber(props.number, index)
        : `${props.number}.${index + 1}`;
    }
    return String(index + 1);
  };

  return (
    <div
      className={cn("block", props.className)}
      style={props.style}
      data-origin={props.origin}
    >
      {enableGapHandles && statements.length === 0 && (
        <GapHandleZone
          insertIndex={0}
          blockContext={props.context}
          origin={props.origin || ""}
          isEmpty
        />
      )}
      {statements.map((stat, index) => {
        const statementKey = createStatementKey(stat);
        const reorderState =
          dragKey === statementKey
            ? "dragging"
            : pendingDrag?.key === statementKey
              ? "pending"
              : "idle";
        return (
          <Fragment key={index}>
            {enableGapHandles && (
              <GapHandleZone
                insertIndex={index}
                blockContext={props.context}
                origin={props.origin || ""}
                isFirstRootGap={props.isRoot && index === 0}
              />
            )}
            <div
              className={cn(
                "statement-container group/stmt my-4 flex flex-col relative",
                {
                  "select-none": reorderState !== "idle",
                  "cursor-grabbing": reorderState === "dragging",
                },
              )}
              data-origin={props.origin}
              data-statement-key={statementKey}
              data-reorder-state={reorderState}
              onPointerDown={(event) => {
                if (!reorderEnabled || event.button !== 0) {
                  return;
                }
                const target = event.target as HTMLElement | null;
                if (!target?.closest(".message-reorder-handle")) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                setSelectedMessage(null);
                setSelectedParticipants([]);
                setPendingDrag({
                  key: statementKey,
                  startX: event.clientX,
                  startY: event.clientY,
                });
                setDropState(null);
              }}
              onPointerMove={(event) => {
                if (!dragKey || !reorderEnabled) {
                  return;
                }
                if (statementKey === dragKey) {
                  return;
                }
                event.stopPropagation();
                const rect = (
                  event.currentTarget as HTMLDivElement
                ).getBoundingClientRect();
                setDropState({
                  key: statementKey,
                  place:
                    event.clientY < rect.top + rect.height / 2
                      ? "before"
                      : "after",
                });
              }}
            >
              {dropState?.key === statementKey && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-sky-500 z-20"
                  style={{
                    [dropState.place === "before" ? "top" : "bottom"]: -8,
                  }}
                />
              )}
              <Statement
                origin={props.origin || ""}
                context={stat}
                collapsed={Boolean(props.collapsed)}
                number={getNumber(index)}
              />
            </div>
          </Fragment>
        );
      })}
      {enableGapHandles && statements.length > 0 && (
        <GapHandleZone
          insertIndex={statements.length}
          blockContext={props.context}
          origin={props.origin || ""}
        />
      )}
    </div>
  );
};
