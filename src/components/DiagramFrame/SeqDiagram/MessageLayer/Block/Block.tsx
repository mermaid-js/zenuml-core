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
              className="absolute -left-4 top-1/2 z-20 -translate-y-1/2 h-6 w-6 rounded-full border border-sky-300 bg-white text-sky-600 shadow-sm hover:bg-sky-50"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setDragKey(createStatementKey(stat));
                setDropState(null);
              }}
            >
              ≡
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
