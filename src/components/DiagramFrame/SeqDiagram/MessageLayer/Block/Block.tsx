import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import { useAtom } from "jotai";
import { codeAtom, onContentChangeAtom } from "@/store/Store";
import { reorderMessageInDsl } from "@/utils/messageReorderTransform";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";

export const Block = (props: {
  origin?: string;
  context?: any;
  number?: string;
  incremental?: boolean;
  collapsed?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const statements: any[] = props.context?.stat() || [];
  const enableReorder = !props.number;
  const [dragKey, setDragKey] = useState<string | null>(null);
  const dragKeyRef = useRef<string | null>(null);
  const [dropState, setDropState] = useState<{
    key: string;
    place: "before" | "after";
  } | null>(null);

  useEffect(() => {
    dragKeyRef.current = dragKey;
  }, [dragKey]);

  useEffect(() => {
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
  }, [code, dragKey, dropState, onContentChange, setCode]);

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
      {statements.map((stat, index) => (
        <div
          className={cn("statement-container my-4 flex flex-col relative")}
          data-origin={props.origin}
          data-statement-key={createStatementKey(stat)}
          key={index}
          onPointerMove={(event) => {
            if (!enableReorder || !dragKey) {
              return;
            }
            const key = createStatementKey(stat);
            if (key === dragKey) {
              return;
            }
            const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
            setDropState({
              key,
              place: event.clientY < rect.top + rect.height / 2 ? "before" : "after",
            });
          }}
        >
          {enableReorder && (
            <button
              type="button"
              data-testid={`message-reorder-handle-${createStatementKey(stat)}`}
              title="Drag to reorder message"
              aria-label="Drag to reorder message"
              className="absolute -left-4 top-1/2 z-20 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-sky-600"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setDragKey(createStatementKey(stat));
                setDropState(null);
              }}
            >
              <svg
                viewBox="0 0 32 32"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <polygon
                  fill="currentColor"
                  points="4 20 15 20 15 26.17 12.41 23.59 11 25 16 30 21 25 19.59 23.59 17 26.17 17 20 28 20 28 18 4 18 4 20"
                />
                <polygon
                  fill="currentColor"
                  points="11 7 12.41 8.41 15 5.83 15 12 4 12 4 14 28 14 28 12 17 12 17 5.83 19.59 8.41 21 7 16 2 11 7"
                />
              </svg>
            </button>
          )}
          {dropState?.key === createStatementKey(stat) && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-sky-500 z-20"
              style={{ [dropState.place === "before" ? "top" : "bottom"]: -8 }}
            />
          )}
          <Statement
            origin={props.origin || ""}
            context={stat}
            collapsed={Boolean(props.collapsed)}
            number={getNumber(index)}
          />
        </div>
      ))}
    </div>
  );
};
