import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  codeAtom,
  coordinatesAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableDividerInsertionAtom,
  onContentChangeAtom,
  pendingEditableRangeAtom,
  rootContextAtom,
  selectedAtom,
  selectedMessageAtom,
  textEditingAtom,
} from "@/store/Store";
import { centerOf } from "./Block/Statement/utils";
import { useCan } from "@/store/interaction/useCan";
import {
  enterMenuAtom,
  exitMenuAtom,
  interactionAtom,
} from "@/store/interaction/interactionAtom";
import { insertDividerInDsl } from "@/utils/insertDividerInDsl";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  configuredMessageCreationAtom,
  FIRST_GAP_CLEARANCE,
  gapHandlesShownAtom,
} from "./gapHandleAtoms";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

const GAP_HEIGHT_EMPTY = 48;
const HANDLE_SIZE = 12;
const HOVER_ZONE_HEIGHT = 16;
const GAP_OFFSET_UP = 5;
const TOOLTIP_DELAY = 350;

export const GapHandleZone = (props: {
  insertIndex: number;
  blockContext: any;
  origin: string;
  isEmpty?: boolean;
  isFirstRootGap?: boolean;
}) => {
  const dividerInsertionEnabled = useAtomValue(enableDividerInsertionAtom);
  const textEditing = useAtomValue(textEditingAtom);
  // Mode and text editing are part of the policy; the embedder flags above
  // stay here because createMessage spans two of them.
  const canCreate = useCan("createMessage");
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
  const [activeParticipant, setActiveParticipant] = useState<string | null>(
    null,
  );
  const [tooltipParticipant, setTooltipParticipant] = useState<string | null>(
    null,
  );
  // The insert menu's open state is the diagram's interaction state (ADR
  // 0002, P2): at most one gap menu is open, and while it is, the policy
  // blocks every other affordance. The menu's own item is not gated.
  const menuId = useId();
  const interaction = useAtomValue(interactionAtom);
  const menuOpen = interaction.kind === "gapMenu" && interaction.id === menuId;
  const enterMenu = useSetAtom(enterMenuAtom);
  const exitMenu = useSetAtom(exitMenuAtom);
  const closeMenu = useCallback(
    () => exitMenu({ kind: "gapMenu", id: menuId }),
    [exitMenu, menuId],
  );
  const [menuX, setMenuX] = useState(0);
  const activeParticipantRef = useRef<string | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const menuItemRef = useRef<HTMLButtonElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (canCreate) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setHovered(false);
    setActiveParticipant(null);
    activeParticipantRef.current = null;
    setTooltipParticipant(null);
  }, [canCreate]);

  // Close this gap's menu when the zone unmounts.
  useEffect(() => closeMenu, [closeMenu]);

  // A press outside the zone closes the menu through the interaction state
  // (ADR 0002, P3); the zone is the menu's active surface while it is open.
  useEffect(() => {
    if (menuOpen) menuItemRef.current?.focus();
  }, [menuOpen]);

  const participants = useMemo(
    () => OrderedParticipants(rootContext).filter((p) => p.name !== _STARTER_),
    [rootContext],
  );
  const configuredMessageCreation = useAtomValue(configuredMessageCreationAtom);
  const gapHandlesShown = useAtomValue(gapHandlesShownAtom);
  const canCreateMessage = canCreate && configuredMessageCreation;
  const canInsertDivider = canCreate && dividerInsertionEnabled;
  // The open menu's own item is its active surface: the policy blocks
  // `createMessage` while the menu is open, but this item must still work.
  const canUseMenuItem = menuOpen && dividerInsertionEnabled;
  // Gate B (ADR 0002, P3): a press on the zone creates a message or opens
  // the divider menu. While this zone's menu is open the zone is the menu's
  // active surface, so a press inside it does not close the menu.
  const zoneCapProps = {
    "data-cap": "createMessage",
    "data-interaction-surface": menuOpen ? "gapMenu" : undefined,
  };

  const updateNearest = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canCreateMessage || dragState || menuOpen) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const scale =
      rect.width / (event.currentTarget.offsetWidth || rect.width) || 1;
    const nearest = participants.reduce<string | null>((best, participant) => {
      if (!best) return participant.name;
      const x = (event.clientX - rect.left) / scale;
      return Math.abs(x - centerOf(coordinates, participant.name)) <
        Math.abs(x - centerOf(coordinates, best))
        ? participant.name
        : best;
    }, null);
    if (nearest === activeParticipantRef.current) return;
    activeParticipantRef.current = nearest;
    setActiveParticipant(nearest);
    setTooltipParticipant(null);
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    if (nearest) {
      tooltipTimerRef.current = setTimeout(
        () => setTooltipParticipant(nearest),
        TOOLTIP_DELAY,
      );
    }
  };

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (canCreate && !dragState && !menuOpen) {
      setHovered(true);
      updateNearest(event);
    }
  };

  const handlePointerLeave = useCallback(() => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setTooltipParticipant(null);
    if (dragState) {
      setHovered(false);
      activeParticipantRef.current = null;
      setActiveParticipant(null);
    } else {
      hideTimerRef.current = setTimeout(() => {
        setHovered(false);
        activeParticipantRef.current = null;
        setActiveParticipant(null);
        hideTimerRef.current = null;
      }, 80);
    }
  }, [dragState]);

  const paddingLeft = centerOf(coordinates, props.origin) + 1;

  const insertDivider = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!canUseMenuItem) return;
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
    [
      code,
      canUseMenuItem,
      onContentChange,
      props.blockContext,
      props.insertIndex,
      setCode,
      setPendingEditableRange,
    ],
  );

  if (!gapHandlesShown) {
    return null;
  }

  const startDrag = (participantName: string, event: React.PointerEvent) => {
    if (event.button !== 0 || !canCreateMessage) return;
    event.preventDefault();
    event.stopPropagation();
    if (!diagramElement) return;

    const diagramRect = diagramElement.getBoundingClientRect();
    const scale =
      diagramRect.width / (diagramElement.offsetWidth || diagramRect.width) ||
      1;
    const buttonEl = event.currentTarget as HTMLElement;
    const buttonRect = buttonEl.getBoundingClientRect();
    const sourceX =
      (buttonRect.left + buttonRect.width / 2 - diagramRect.left) / scale;
    const sourceY =
      (buttonRect.top + buttonRect.height / 2 - diagramRect.top) / scale;

    setSelectedMessage(null);
    setSelectedParticipants([]);
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

  const showHandle =
    hovered && !dragState && !menuOpen && activeParticipant && canCreateMessage;
  const tooltipX = activeParticipant
    ? Math.max(
        90,
        Math.min(
          centerOf(coordinates, activeParticipant),
          (zoneRef.current?.offsetWidth ?? 300) - 90,
        ),
      )
    : 0;

  const openMenu = (clientX: number, currentTarget: HTMLDivElement) => {
    if (!canInsertDivider) return;
    const rect = currentTarget.getBoundingClientRect();
    const scale = rect.width / (currentTarget.offsetWidth || rect.width) || 1;
    setMenuX(
      Math.max(
        0,
        Math.min(
          (clientX - rect.left) / scale,
          currentTarget.offsetWidth - 140,
        ),
      ),
    );
    enterMenu({ kind: "gapMenu", id: menuId });
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canInsertDivider) return;
    event.preventDefault();
    event.stopPropagation();
    openMenu(event.clientX, event.currentTarget);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (menuOpen && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      zoneRef.current?.focus();
    } else if (
      canInsertDivider &&
      (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10"))
    ) {
      event.preventDefault();
      event.stopPropagation();
      openMenu(
        event.currentTarget.getBoundingClientRect().left + 20,
        event.currentTarget,
      );
    }
  };

  function renderHandles() {
    return (
      <>
        {showHandle && (
          <button
            type="button"
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-500 bg-white text-slate-700 flex items-center justify-center cursor-crosshair hover:border-slate-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            style={{
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              left: `${centerOf(coordinates, activeParticipant)}px`,
              zIndex: 50,
              pointerEvents: "auto",
            }}
            data-testid={`message-create-handle-${props.insertIndex}-${activeParticipant}`}
            aria-label={`Drag to create a message from ${activeParticipant}`}
            onPointerDown={(event) => startDrag(activeParticipant, event)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 10 10"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M2 5H8 M5 2V8"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        )}
        {showHandle && tooltipParticipant === activeParticipant && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full rounded bg-gray-900 px-2 py-1 text-[11px] leading-4 text-white shadow-sm pointer-events-none"
            style={{
              left: `${tooltipX}px`,
              top: props.isFirstRootGap ? -46 : -8,
              zIndex: 60,
              width: "max-content",
              maxWidth: "min(180px, calc(100% - 16px))",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
            }}
            data-testid={`message-create-tooltip-${props.insertIndex}`}
          >
            Drag from {activeParticipant} to a participant
          </div>
        )}
        {canUseMenuItem && (
          <div
            role="menu"
            data-testid={`gap-insert-menu-${props.insertIndex}`}
            className="absolute top-full mt-1 min-w-[140px] rounded border border-slate-200 bg-white p-1 shadow-lg"
            style={{ left: menuX, zIndex: 60, pointerEvents: "auto" }}
          >
            <button
              ref={menuItemRef}
              type="button"
              role="menuitem"
              data-testid={`divider-insert-${props.insertIndex}`}
              className="block w-full rounded px-2 py-1 text-left text-xs text-slate-800 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
              onClick={(event) => {
                insertDivider(event);
                closeMenu();
              }}
            >
              Insert divider
            </button>
          </div>
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
          pointerEvents: textEditing ? "none" : undefined,
        }}
        data-testid={`message-gap-${props.insertIndex}`}
        ref={zoneRef}
        {...zoneCapProps}
        onPointerEnter={handlePointerEnter}
        onPointerMove={updateNearest}
        onPointerLeave={handlePointerLeave}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        tabIndex={canInsertDivider || menuOpen ? 0 : undefined}
        aria-label={
          canInsertDivider || menuOpen ? "Insertion options" : undefined
        }
      >
        {renderHandles()}
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        // The message layer starts 12px above the participant headers' bottom.
        // This clearance ends at the headers; the hover strip below it uses the
        // first statement's existing top margin.
        height: props.isFirstRootGap ? FIRST_GAP_CLEARANCE : 0,
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
        ref={zoneRef}
        {...zoneCapProps}
        className="absolute left-0 right-0"
        style={{
          top: props.isFirstRootGap
            ? FIRST_GAP_CLEARANCE
            : -(HOVER_ZONE_HEIGHT / 2) - GAP_OFFSET_UP,
          height: HOVER_ZONE_HEIGHT,
          pointerEvents: textEditing ? "none" : "auto",
        }}
        onPointerEnter={handlePointerEnter}
        onPointerMove={updateNearest}
        onPointerLeave={handlePointerLeave}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        tabIndex={canInsertDivider || menuOpen ? 0 : undefined}
        aria-label={
          canInsertDivider || menuOpen ? "Insertion options" : undefined
        }
      >
        {renderHandles()}
      </div>
    </div>
  );
};
