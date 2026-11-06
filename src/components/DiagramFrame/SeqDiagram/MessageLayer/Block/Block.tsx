import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  enableMessageReorderAtom,
  messageReorderDragAtom,
  messageReorderDropAtom,
  messageReorderPendingAtom,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { useCan } from "@/store/interaction/useCan";
import {
  exitMenuAtom,
  interactionAtom,
} from "@/store/interaction/interactionAtom";
import { Fragment } from "react";
import { GapHandleZone } from "../GapHandleZone";
import { MessageReorderSession } from "./MessageReorderSession";

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
  const statements: any[] = props.context?.stat() || [];
  const enableGapHandles = props.enableGapHandles ?? false;
  const dragKey = useAtomValue(messageReorderDragAtom);
  const [pendingDrag, setPendingDrag] = useAtom(messageReorderPendingAtom);
  const [dropState, setDropState] = useAtom(messageReorderDropAtom);
  const enableMessageReorder = useAtomValue(enableMessageReorderAtom);
  const canReorder = useCan("reorder");
  // A row reveals its reorder handle on hover only when hover affordances are
  // allowed (idle), or when the row is part of the current state: the moving
  // message of a reorder, or the selected message of an open menu (the other
  // rows render no handle then).
  const canHover = useCan("hoverAffordance");
  const interactionKind = useAtomValue(interactionAtom).kind;
  const setSelectedMessage = useSetAtom(selectedMessageAtom);
  const setSelectedParticipants = useSetAtom(selectedAtom);
  const exitMenu = useSetAtom(exitMenuAtom);
  // Unlike every other editing surface, this drag used to run with no
  // `enable*` flag and no respect for `RenderMode.Static` — a render-only
  // host (SVG export, a static embed) could have its diagram silently
  // rewritten by an accidental drag. `reorder` also covers the mode, text
  // editing and any other interaction that owns the diagram (ADR 0002).
  const reorderEnabled = enableMessageReorder && canReorder;

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
      {props.isRoot && <MessageReorderSession />}
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
        const hoverReveal =
          canHover ||
          interactionKind === "messageMenu" ||
          reorderState !== "idle";
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
              data-hover-reveal={hoverReveal ? undefined : "off"}
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
                // R1: the reorder drag replaces the open message menu.
                exitMenu({ kind: "messageMenu" });
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
