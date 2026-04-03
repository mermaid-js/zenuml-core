import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import { useAtom } from "jotai";
import {
  codeAtom,
  messageReorderDragAtom,
  messageReorderDropAtom,
  messageReorderPendingAtom,
  onContentChangeAtom,
} from "@/store/Store";
import { reorderMessageInDsl } from "@/utils/messageReorderTransform";
import { useAtomValue } from "jotai";
import { Fragment, useEffect, useRef, useState } from "react";
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
  isRoot?: boolean;
}) => {
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const statements: any[] = props.context?.stat() || [];
  const enableReorder = true;
  const [dragKey, setDragKey] = useAtom(messageReorderDragAtom);
  const dragKeyRef = useRef<string | null>(null);
  const [pendingDrag, setPendingDrag] = useAtom(messageReorderPendingAtom);
  const [dropState, setDropState] = useAtom(messageReorderDropAtom);

  useEffect(() => {
    dragKeyRef.current = dragKey;
  }, [dragKey]);

  useEffect(() => {
    if (!pendingDrag && !dragKey) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "grabbing";

    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [dragKey, pendingDrag]);

  useEffect(() => {
    if (!props.isRoot) {
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
  }, [dragKey, pendingDrag, props.isRoot, setDragKey, setPendingDrag]);

  useEffect(() => {
    if (!props.isRoot) {
      return;
    }
    if (!dragKey) {
      return;
    }
    const onPointerUp = () => {
      const sourceKey = dragKeyRef.current;
      if (!sourceKey || !dropState || dropState.key === sourceKey) {
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

    window.addEventListener("pointerup", onPointerUp, { once: true });
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [code, dragKey, dropState, onContentChange, props.isRoot, setCode, setDragKey, setDropState]);

  const getNumber = (index: number) => {
    if (props.number) {
      return props.incremental
        ? increaseNumber(props.number, index)
        : `${props.number}.${index + 1}`;
    }
    return String(index + 1);
  };
  const enableGapHandles = true;

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
            />
          )}
          <div
            className={cn("statement-container group/stmt my-4 flex flex-col relative", {
              "select-none": reorderState !== "idle",
              "cursor-grabbing": reorderState === "dragging",
            })}
            data-origin={props.origin}
            data-statement-key={statementKey}
            data-reorder-state={reorderState}
            onPointerDown={(event) => {
              if (!enableReorder) {
                return;
              }
              const target = event.target as HTMLElement | null;
              if (
                !target?.closest(".message") ||
                target.closest("[contenteditable='true']")
              ) {
                return;
              }
              event.stopPropagation();
              setPendingDrag({
                key: statementKey,
                startX: event.clientX,
                startY: event.clientY,
              });
              setDropState(null);
            }}
            onPointerMove={(event) => {
              if (!enableReorder || !dragKey) {
                return;
              }
              if (statementKey === dragKey) {
                return;
              }
              event.stopPropagation();
              const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
              setDropState({
                key: statementKey,
                place: event.clientY < rect.top + rect.height / 2 ? "before" : "after",
              });
            }}
          >
            {dropState?.key === statementKey && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-sky-500 z-20"
                style={{ [dropState.place === "before" ? "top" : "bottom"]: -8 }}
              />
            )}
            {enableReorder && (
              <div
                className="reorder-grip absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/stmt:opacity-40 transition-opacity pointer-events-none"
                data-testid="reorder-grip"
                aria-hidden="true"
              >
                <svg width="6" height="10" viewBox="0 0 6 10" fill="currentColor" className="text-slate-400">
                  <circle cx="1.5" cy="1.5" r="1" />
                  <circle cx="4.5" cy="1.5" r="1" />
                  <circle cx="1.5" cy="5" r="1" />
                  <circle cx="4.5" cy="5" r="1" />
                  <circle cx="1.5" cy="8.5" r="1" />
                  <circle cx="4.5" cy="8.5" r="1" />
                </svg>
              </div>
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
