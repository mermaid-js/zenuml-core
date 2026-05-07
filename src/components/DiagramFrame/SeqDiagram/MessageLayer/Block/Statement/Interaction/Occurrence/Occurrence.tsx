import { CollapseButton } from "./CollapseButton";
import { EventBus } from "@/EventBus";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils";
import { Block } from "../../../Block";
import { centerOf } from "../../utils";
import { useAtomValue, useSetAtom } from "jotai";
import {
  coordinatesAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableMessageInsertionAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { Message } from "../../Message/Message";
import { syncMessageNormalizer } from "@/utils/messageNormalizers";
import { CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { AssignmentReturnLabel } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/AssignmentReturnLabel";

export const Occurrence = (props: {
  context: any;
  participant: any;
  rtl?: boolean;
  number?: string;
  className?: string;
  textStyle?: CSSProperties;
  messageClassNames?: string[];
  isSelf?: boolean;
  interactionWidth?: number;
  enableCreateDrag?: boolean;
}) => {
  const mode = useAtomValue(modeAtom);
  const messageInsertionEnabled = useAtomValue(enableMessageInsertionAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const setCreateDrag = useSetAtom(createMessageDragAtom);
  const setSelectedParticipants = useSetAtom(selectedAtom);
  const setSelectedMessage = useSetAtom(selectedMessageAtom);
  const [collapsed, setCollapsed] = useState(false);

  const debug = localStorage.getItem("zenumlDebug");

  const computedCenter = () => {
    try {
      return centerOf(coordinates, props.participant);
    } catch (e) {
      console.error(e);
      return 0;
    }
  };
  const hasAnyStatementsExceptReturn = () => {
    const braceBlock = props.context.braceBlock();
    if (!braceBlock) return false;
    const stats = braceBlock.block()?.stat() || [];
    const len = stats.length;
    if (len > 1) return true;
    //when the only one statement is not the RetContext
    return len === 1 && stats[0]["ret"]() == null;
  };
  const toggle = () => {
    setCollapsed(!collapsed);

    //update participant top in this cases: has child and sibling creation statement
    //e.g. : a.call() { b = new B(); b.call() { c = new C() c.call(){return}}}
    EventBus.emit("participant_set_top");
  };

  useEffect(() => {
    setCollapsed(false);
  }, [props.context]);

  const assigneeData = useMemo(() => {
    // Check if context has Assignment function (works for both CreationContext and MessageContext)
    if (typeof props.context?.Assignment !== "function") {
      return null;
    }

    const assignment = props.context.Assignment();
    if (!assignment) return null;
    const assignee = assignment.assignee || "";
    if (!assignee) return null;
    return {
      assignee: assignment.assignee,
      type: assignment.type,
      assigneePosition: assignment.assigneePosition,
      typePosition: assignment.typePosition,
    };
  }, [props.context]);

  const statementNumber = props.number
    ? `${props.number}.${props.context?.Statements()?.length + 1}`
    : undefined;
  const nestedBlockContext = props.context?.braceBlock?.()?.block?.() ?? null;
  const insertIndex =
    props.context?.Statements?.()?.length ??
    nestedBlockContext?.stat?.()?.length ??
    0;

  const dragEnabled =
    !!props.enableCreateDrag &&
    messageInsertionEnabled &&
    mode === RenderMode.Dynamic;

  const startCreateDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragEnabled || !diagramElement) {
      return;
    }

    const currentTarget = event.currentTarget as HTMLDivElement;
    const target = event.target as HTMLElement | null;
    const nestedBlockElement = Array.from(currentTarget.children).find(
      (child) => child.classList.contains("block"),
    );
    if (
      target?.closest(".occurrence-collapsible-header") ||
      target?.closest(".message") ||
      (nestedBlockElement?.contains(target) ?? false) ||
      target?.closest("[contenteditable='true']")
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const diagramRect = diagramElement.getBoundingClientRect();
    const barRect = currentTarget.getBoundingClientRect();
    const sourceX = barRect.left - diagramRect.left + barRect.width / 2;
    const sourceY = event.clientY - diagramRect.top;

    setSelectedMessage(null);
    setSelectedParticipants([props.participant]);
    setCreateDrag({
      source: props.participant,
      sourceX,
      sourceY,
      pointerX: sourceX,
      pointerY: sourceY,
      hoverTarget: null,
      insertIndex,
      blockContext: nestedBlockContext,
      hostContext: props.context,
    });
  };

  return (
    <div
      className={cn(
        "occurrence min-h-6 shadow-occurrence border-skin-occurrence bg-skin-occurrence rounded-sm border-2 relative left-full w-[15px] mt-[-2px] pl-[6px]",
        { "right-to-left left-[-14px]": props.rtl },
        {
          "cursor-grab": dragEnabled,
        },
        props.className,
      )}
      data-el-type="occurrence"
      data-belongs-to={props.participant}
      data-x-offset={0}
      data-debug-center-of={computedCenter()}
      onPointerDown={startCreateDrag}
      title={
        dragEnabled
          ? `Drag to create a message from ${props.participant}`
          : undefined
      }
    >
      {debug && (
        <>
          <div className="absolute w-full left-0 bg-amber-700 h-3 -top-1 flex justify-center items-center">
            <div className="w-px h-full bg-black"></div>
          </div>
          <div className="absolute w-full left-0 bg-amber-700 h-3 -bottom-1 flex justify-center items-center">
            <div className="w-px h-full bg-black"></div>
          </div>
        </>
      )}
      {hasAnyStatementsExceptReturn() && (
        <CollapseButton collapsed={collapsed} onClick={toggle} />
      )}
      {props.context.braceBlock() && (
        <Block
          origin={props.participant}
          context={props.context.braceBlock().block()}
          number={props.number}
          collapsed={collapsed}
        ></Block>
      )}
      {/* Render return statement for non-self sync message and creation */}
      {assigneeData && !props.isSelf && (
        <div className={cn("statement-container my-4")}>
          <div
            className={cn(
              "interaction return relative right-to-left text-left text-sm text-skin-message",
            )}
          >
            <Message
              className={cn(
                "return transform -translate-y-full pointer-events-auto",
                props.messageClassNames,
              )}
              context={props.context}
              rtl={!props.rtl}
              type="return"
              number={statementNumber}
              textStyle={props.textStyle}
              style={
                props.interactionWidth !== undefined
                  ? {
                      width: `${props.interactionWidth}px`,
                      transform: props.rtl
                        ? `translateX(7px)`
                        : `translateX(calc(-100% - 7px))`,
                    }
                  : undefined
              }
            >
              <AssignmentReturnLabel
                assignee={assigneeData.assignee}
                type={assigneeData.type}
                assigneePosition={assigneeData.assigneePosition}
                typePosition={assigneeData.typePosition}
                normalizeText={syncMessageNormalizer}
              />
            </Message>
          </div>
        </div>
      )}
    </div>
  );
};
