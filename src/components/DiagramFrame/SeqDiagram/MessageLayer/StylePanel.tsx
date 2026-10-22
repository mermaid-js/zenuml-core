import { cn } from "@/utils";
import { usePopoverPresence } from "@/components/common/usePopoverPresence";
import { getLineEnd, getLineHead, getPrevLine } from "@/utils/StringUtil";
import {
  canTransformMessageType,
  type MessageArrowType,
  transformMessageType,
} from "@/utils/messageTypeTransform";
import {
  type WrapFragmentType,
  wrapMessageInFragment,
} from "@/utils/messageWrapTransform";
import {
  parseStyleComment,
  toggleMessageStyle,
} from "@/utils/messageStyleToggle";
import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import {
  codeAtom,
  diagramElementAtom,
  onContentChangeAtom,
  onMessageClickAtom,
  pendingEditableRangeAtom,
  selectedAtom,
  selectedMessageAtom,
  textEditingAtom,
} from "@/store/Store";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  enterMenuAtom,
  exitMenuAtom,
  interactionAtom,
} from "@/store/interaction/interactionAtom";
import { useActiveSurface, useTextEditing } from "@/store/interaction/useCan";
import { FloatingPortal, useFloating } from "@floating-ui/react";

const btns = [
  {
    name: "bold",
    content: "B",
    class: "font-bold",
  },
  {
    name: "italic",
    content: "I",
    class: "italic",
  },
  {
    name: "underline",
    content: "U",
    class: "underline",
  },
  {
    name: "strikethrough",
    content: "S",
    class: "line-through",
  },
];

const wrapTypes: WrapFragmentType[] = ["alt", "loop", "opt", "par"];

export const StylePanel = () => {
  const store = useStore();
  const [code, setCode] = useAtom(codeAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const setOnMessageClick = useSetAtom(onMessageClickAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);
  const setSelectedParticipants = useSetAtom(selectedAtom);
  const [selectedMessage, setSelectedMessage] = useAtom(selectedMessageAtom);
  // A label edit that starts while the menu is open ends the menu.
  const textEditing = useTextEditing();
  // The menu's buttons show while `messageMenu` is the active surface.
  const surfaceShown = useActiveSurface()?.kind === "messageMenu";
  // P2: the card stays mounted for its 120 ms exit animation.
  const presence = usePopoverPresence(surfaceShown);
  const themeClasses = Array.from(diagramElement?.classList ?? [])
    .filter((name) => name.startsWith("theme-"))
    .join(" ");
  // The open state is the diagram's interaction state (ADR 0002, P2): the
  // menu is open while the interaction is `messageMenu`. A selected message
  // with its menu closed is `idle` and blocks nothing.
  const isOpen = useAtomValue(interactionAtom).kind === "messageMenu";
  const enterMenu = useSetAtom(enterMenuAtom);
  const exitMenu = useSetAtom(exitMenuAtom);
  const closeMenu = useCallback(
    () => exitMenu({ kind: "messageMenu" }),
    [exitMenu],
  );
  const [existingStyles, setExistingStyles] = useState<string[]>([]);
  const [hasMessageContext, setHasMessageContext] = useState(false);

  const updateCode = (newCode: string) => {
    setCode(newCode);
    onContentChange(newCode);
  };

  const messageData = useRef({
    start: 0,
    lineHead: 0,
    line: "",
    currentType: "sync" as MessageArrowType,
    source: "",
    target: "",
    signature: "",
    labelStart: -1,
    labelEnd: -1,
  });

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) closeMenu();
    },
  });

  const handleClick = (style: string) => {
    closeMenu();
    if (!hasMessageContext) return;
    updateCode(
      toggleMessageStyle({
        code,
        messageStart: messageData.current.start,
        style,
      }),
    );
  };

  const handleTypeClick = (targetType: MessageArrowType) => {
    const message = messageData.current;
    if (message.currentType === targetType) return;
    if (
      !canTransformMessageType({
        line: message.line,
        currentType: message.currentType,
        targetType,
        source: message.source,
        target: message.target,
        signature: message.signature,
      })
    )
      return;
    const nextLine = transformMessageType({
      line: message.line,
      currentType: message.currentType,
      targetType,
      source: message.source,
      target: message.target,
      signature: message.signature,
    });
    if (!nextLine) {
      return;
    }

    const lineTail = message.lineHead + message.line.length;
    const labelText = message.signature;
    const labelOffset = labelText ? nextLine.lastIndexOf(labelText) : -1;
    updateCode(
      code.slice(0, message.lineHead) + nextLine + code.slice(lineTail),
    );
    message.currentType = targetType;
    message.line = nextLine;
    if (labelOffset >= 0 && labelText) {
      const start = message.lineHead + labelOffset;
      const end = start + labelText.length - 1;
      setSelectedMessage({ start, end, token: Date.now() });
      // The menu stays open on the re-typed message.
      enterMenu({ kind: "messageMenu", start, end });
    }
  };

  const handleRenameClick = () => {
    const message = messageData.current;
    // Disabled for a message with no label: aria-disabled keeps the control
    // focusable and its title readable, so the click itself does nothing.
    if (message.labelStart < 0 || message.labelEnd < 0) {
      return;
    }
    closeMenu();
    setPendingEditableRange({
      start: message.labelStart,
      end: message.labelEnd,
      token: Date.now(),
    });
  };

  const handleWrapClick = (type: WrapFragmentType) => {
    closeMenu();
    const message = messageData.current;
    const next = wrapMessageInFragment({
      code,
      line: message.line,
      lineHead: message.lineHead,
      type,
    });
    updateCode(next.code);
    setSelectedMessage(null);
    setPendingEditableRange({
      start: next.conditionPosition[0],
      end: next.conditionPosition[1],
      token: Date.now(),
    });
  };

  // Click-away and Escape belong to the interaction state (ADR 0002, P3):
  // `InteractionController` closes this menu and clears the message
  // selection, keeping it when the press lands on the selected message.

  useEffect(() => {
    setOnMessageClick((context: any, element: HTMLElement) => {
      // make sure this is triggered after the outsideclicking
      setTimeout(() => {
        // A quick double click can begin editing before this callback runs.
        if (store.get(textEditingAtom)) return;
        const message = messageData.current;
        message.start = context.start.start;
        message.lineHead = getLineHead(code, message.start);
        message.line = code.slice(
          message.lineHead,
          getLineEnd(code, message.lineHead),
        );
        setExistingStyles(
          parseStyleComment(getPrevLine(code, message.start)).styles,
        );
        const interactionElement = element.closest(".interaction");
        const classList = interactionElement?.classList;
        const signatureCtx = context
          ?.messageBody?.()
          ?.func?.()
          ?.signature?.()?.[0];
        const asyncContent = context?.content?.();
        const creationParams = context?.creationBody?.()?.parameters?.();
        message.currentType = classList?.contains("creation")
          ? "creation"
          : classList?.contains("return")
            ? "return"
            : classList?.contains("async")
              ? "async"
              : "sync";
        message.source = interactionElement?.getAttribute("data-source") || "";
        message.target = interactionElement?.getAttribute("data-target") || "";
        message.signature =
          interactionElement?.getAttribute("data-signature") || "";
        if (classList?.contains("creation")) {
          message.labelStart = creationParams?.start.start ?? -1;
          message.labelEnd = creationParams?.stop.stop ?? -1;
        } else if (classList?.contains("async")) {
          message.labelStart = asyncContent?.start.start ?? -1;
          message.labelEnd = asyncContent?.stop.stop ?? -1;
        } else if (classList?.contains("return")) {
          message.labelStart = context?.start?.start ?? -1;
          message.labelEnd = context?.stop?.stop ?? -1;
        } else {
          message.labelStart = signatureCtx?.start?.start ?? -1;
          message.labelEnd = signatureCtx?.stop?.stop ?? -1;
        }
        setSelectedParticipants([]);
        setSelectedMessage({
          start: message.labelStart >= 0 ? message.labelStart : message.start,
          end:
            message.labelEnd >= 0
              ? message.labelEnd
              : (context?.stop?.stop ?? message.start),
          token: Date.now(),
        });
        refs.setReference(element);
        setHasMessageContext(Boolean(context));
        enterMenu({
          kind: "messageMenu",
          start: message.labelStart >= 0 ? message.labelStart : message.start,
          end:
            message.labelEnd >= 0
              ? message.labelEnd
              : (context?.stop?.stop ?? message.start),
        });
      }, 0);
    });
  }, [
    code,
    enterMenu,
    refs,
    setOnMessageClick,
    setSelectedMessage,
    setSelectedParticipants,
    store,
  ]);

  useEffect(() => {
    if (!selectedMessage) {
      closeMenu();
    }
  }, [closeMenu, selectedMessage]);

  useEffect(() => {
    if (textEditing) closeMenu();
  }, [closeMenu, textEditing]);

  const [openSubmenu, setOpenSubmenu] = useState<"type" | "wrap" | null>(null);
  const submenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSub = useCallback((menu: "type" | "wrap") => {
    if (submenuTimer.current) {
      clearTimeout(submenuTimer.current);
      submenuTimer.current = null;
    }
    setOpenSubmenu(menu);
  }, []);

  const closeSub = useCallback(() => {
    submenuTimer.current = setTimeout(() => setOpenSubmenu(null), 120);
  }, []);

  // Reset submenu when panel closes
  useEffect(() => {
    if (!isOpen) setOpenSubmenu(null);
  }, [isOpen]);

  const renameDisabled =
    messageData.current.labelStart < 0 || messageData.current.labelEnd < 0;

  return (
    <FloatingPortal>
      <div
        id="style-panel"
        className="zenuml"
        data-interaction-surface="messageMenu"
        ref={refs.setFloating}
        style={{ ...floatingStyles, zIndex: 40 }}
      >
        {presence.mounted && (
          <div
            ref={presence.ref}
            className={cn(
              "flex items-center bg-white shadow-zu-md z-40 rounded-zu-panel p-1 gap-1",
              presence.className,
              themeClasses,
            )}
          >
            <div className="flex">
              {btns.map((btn) => (
                <button
                  type="button"
                  key={btn.name}
                  aria-label={btn.name}
                  aria-pressed={existingStyles.includes(btn.class)}
                  title={
                    existingStyles.includes(btn.class)
                      ? `Remove ${btn.name}`
                      : `Apply ${btn.name}`
                  }
                  onClick={() => handleClick(btn.class)}
                  className={cn(
                    "zu-press w-6 mx-1 py-1 rounded-zu-md text-black text-center cursor-pointer hover:bg-gray-200 focus-visible:outline-none focus-visible:shadow-zu-focus",
                    [
                      btn.class,
                      { "bg-gray-100": existingStyles.includes(btn.class) },
                    ],
                  )}
                >
                  {btn.content}
                </button>
              ))}
            </div>
            <div className="w-px self-stretch bg-gray-200" />
            <div className="flex items-center gap-1">
              <button
                type="button"
                data-testid="message-rename"
                // Not borrowed from Claude (assessment P4): dimming a row while
                // keeping its inner controls readable. A disabled control here
                // is aria-disabled, stays focusable and explains itself in its
                // title.
                aria-disabled={renameDisabled ? "true" : undefined}
                className={cn(
                  "zu-press px-2 py-1 rounded-zu-md text-[11px] uppercase tracking-wide text-black text-center cursor-pointer hover:bg-gray-200 focus-visible:outline-none focus-visible:shadow-zu-focus",
                  {
                    "opacity-40 cursor-not-allowed": renameDisabled,
                  },
                )}
                title={
                  renameDisabled
                    ? "Cannot rename: message has no label"
                    : "Rename message label"
                }
                onClick={handleRenameClick}
              >
                Rename
              </button>
            </div>
            <div className="w-px self-stretch bg-gray-200" />
            {/* Type submenu trigger */}
            <div
              className="relative"
              onPointerEnter={() => openSub("type")}
              onPointerLeave={closeSub}
            >
              <button
                type="button"
                data-testid="message-type-menu"
                className={cn(
                  "zu-press px-2 py-1 rounded-zu-md text-[11px] uppercase tracking-wide text-black text-center cursor-pointer hover:bg-gray-200 focus-visible:outline-none focus-visible:shadow-zu-focus",
                  { "bg-gray-100": openSubmenu === "type" },
                )}
                title="Change message type"
                aria-expanded={openSubmenu === "type"}
                aria-haspopup="true"
                onClick={() => openSub("type")}
              >
                {messageData.current.currentType} ▾
              </button>
              {openSubmenu === "type" && (
                <div className="absolute left-0 top-full mt-1 bg-white shadow-zu-pop rounded-zu-lg border border-gray-200 p-1 flex flex-col gap-0.5 z-50 min-w-[90px]">
                  {(
                    [
                      "sync",
                      "async",
                      "return",
                      "creation",
                    ] as MessageArrowType[]
                  ).map((type) => {
                    const canTransform = canTransformMessageType({
                      line: messageData.current.line,
                      currentType: messageData.current.currentType,
                      targetType: type,
                      source: messageData.current.source,
                      target: messageData.current.target,
                      signature: messageData.current.signature,
                    });
                    const isCurrent = messageData.current.currentType === type;
                    const disabledTitle = isCurrent
                      ? `Already ${type}`
                      : !canTransform && type === "sync"
                        ? "Label must be a valid method name (no spaces) to switch to sync"
                        : !canTransform &&
                            messageData.current.currentType === "creation"
                          ? "Cannot convert creation messages"
                          : !canTransform
                            ? `Cannot convert to ${type}`
                            : undefined;
                    return (
                      <button
                        type="button"
                        key={type}
                        data-testid={`message-type-${type}`}
                        aria-label={`Change to ${type} message type`}
                        aria-pressed={isCurrent}
                        title={disabledTitle}
                        aria-disabled={!canTransform ? "true" : undefined}
                        onClick={() => {
                          // A disabled item does nothing and the submenu
                          // stays open.
                          if (!canTransform) return;
                          handleTypeClick(type);
                          setOpenSubmenu(null);
                        }}
                        className={cn(
                          "zu-press px-2 py-1 rounded-zu-md text-[11px] uppercase tracking-wide text-black text-left hover:bg-gray-100 focus-visible:outline-none focus-visible:shadow-zu-focus",
                          {
                            "bg-gray-100 font-semibold": isCurrent,
                            "opacity-40 cursor-not-allowed": !canTransform,
                            "cursor-pointer": canTransform && !isCurrent,
                          },
                        )}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="w-px self-stretch bg-gray-200" />
            {/* Wrap submenu trigger */}
            <div
              className="relative"
              onPointerEnter={() => openSub("wrap")}
              onPointerLeave={closeSub}
            >
              <button
                type="button"
                data-testid="message-wrap-menu"
                className={cn(
                  "zu-press px-2 py-1 rounded-zu-md text-[11px] uppercase tracking-wide text-black text-center cursor-pointer hover:bg-gray-200 focus-visible:outline-none focus-visible:shadow-zu-focus",
                  { "bg-gray-100": openSubmenu === "wrap" },
                )}
                title="Wrap in fragment"
                aria-expanded={openSubmenu === "wrap"}
                aria-haspopup="true"
                onClick={() => openSub("wrap")}
              >
                Wrap ▾
              </button>
              {openSubmenu === "wrap" && (
                <div className="absolute left-0 top-full mt-1 bg-white shadow-zu-pop rounded-zu-lg border border-gray-200 p-1 flex flex-col gap-0.5 z-50 min-w-[70px]">
                  {wrapTypes.map((type) => (
                    <button
                      type="button"
                      key={type}
                      data-testid={`message-wrap-${type}`}
                      className="zu-press px-2 py-1 rounded-zu-md text-[11px] uppercase tracking-wide text-black text-left cursor-pointer hover:bg-gray-100 focus-visible:outline-none focus-visible:shadow-zu-focus"
                      title={`Wrap in ${type} fragment`}
                      aria-label={`Wrap in ${type} fragment`}
                      onClick={() => handleWrapClick(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FloatingPortal>
  );
};
