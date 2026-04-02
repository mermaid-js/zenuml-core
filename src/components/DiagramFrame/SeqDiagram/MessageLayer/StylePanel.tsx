import { cn } from "@/utils";
import { getLineHead, getPrevLine, getPrevLineHead } from "@/utils/StringUtil";
import {
  canTransformMessageType,
  type MessageArrowType,
  transformMessageType,
} from "@/utils/messageTypeTransform";
import {
  type WrapFragmentType,
  wrapMessageInFragment,
} from "@/utils/messageWrapTransform";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  codeAtom,
  onContentChangeAtom,
  onMessageClickAtom,
  pendingEditableRangeAtom,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { useEffect, useRef, useState } from "react";
import { useFloating } from "@floating-ui/react";
import { useOutsideClick } from "@/functions/useOutsideClick";

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
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const setOnMessageClick = useSetAtom(onMessageClickAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);
  const setSelectedParticipants = useSetAtom(selectedAtom);
  const [selectedMessage, setSelectedMessage] = useAtom(selectedMessageAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [existingStyles, setExistingStyles] = useState<string[]>([]);
  const [hasMessageContext, setHasMessageContext] = useState(false);

  const updateCode = (newCode: string) => {
    setCode(newCode);
    onContentChange(newCode);
  };

  const messageData = useRef({
    start: 0,
    lineHead: 0,
    prevLine: "",
    leadingSpaces: "",
    prevLineIsComment: false,
    hasStyleBrackets: false,
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
    onOpenChange: setIsOpen,
  });

  const handleClick = (style: string) => {
    setIsOpen(false);
    if (!hasMessageContext) return;
    const message = messageData.current;
    if (message.prevLineIsComment) {
      let newComment = "";
      if (message.hasStyleBrackets) {
        let updatedStyles;

        if (existingStyles.includes(style)) {
          updatedStyles = existingStyles.filter((s) => s !== style);
        } else {
          updatedStyles = [...existingStyles, style];
        }

        newComment = `${message.leadingSpaces}// [${updatedStyles
          .filter(Boolean)
          .join(", ")}] ${message.prevLine
          .slice(message.prevLine.indexOf("]") + 1)
          .trimStart()}`;
      } else {
        newComment = `${message.leadingSpaces}// [${style}] ${message.prevLine
          .slice((message.prevLine.match(/\/\/*/)?.index || -2) + 2)
          .trimStart()}`;
      }
      if (!newComment.endsWith("\n")) newComment += "\n";
      updateCode(
        code.slice(0, getPrevLineHead(code, message.start)) +
          newComment +
          code.slice(message.lineHead),
      );
    } else {
      updateCode(
        code.slice(0, message.lineHead) +
          `${message.leadingSpaces}// [${style}]\n` +
          code.slice(message.lineHead),
      );
    }
  };

  const handleTypeClick = (targetType: MessageArrowType) => {
    setIsOpen(false);
    const message = messageData.current;
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
    updateCode(
      code.slice(0, message.lineHead) +
        nextLine +
        code.slice(lineTail),
    );
  };

  const handleRenameClick = () => {
    setIsOpen(false);
    const message = messageData.current;
    if (message.labelStart < 0 || message.labelEnd < 0) {
      return;
    }
    setPendingEditableRange({
      start: message.labelStart,
      end: message.labelEnd,
      token: Date.now(),
    });
  };

  const handleWrapClick = (type: WrapFragmentType) => {
    setIsOpen(false);
    const message = messageData.current;
    const next = wrapMessageInFragment({
      code,
      line: message.line,
      lineHead: message.lineHead,
      type,
    });
    updateCode(next.code);
    setPendingEditableRange({
      start: next.conditionPosition[0],
      end: next.conditionPosition[1],
      token: Date.now(),
    });
  };

  useOutsideClick(refs.floating.current, () => {
    setIsOpen(false);
    setSelectedMessage(null);
  });

  useEffect(() => {
    setOnMessageClick((context: any, element: HTMLElement) => {
      // make sure this is triggered after the outsideclicking
      setTimeout(() => {
        const message = messageData.current;
        message.start = context.start.start;
        message.lineHead = getLineHead(code, message.start);
        const lineTail = code.indexOf("\n", message.lineHead);
        message.line = lineTail === -1
          ? code.slice(message.lineHead)
          : code.slice(message.lineHead, lineTail);
        message.prevLine = getPrevLine(code, message.start);
        message.leadingSpaces =
          code.slice(message.lineHead).match(/^\s*/)?.[0] || "";
        message.prevLineIsComment = message.prevLine.trim().startsWith("//");
        if (message.prevLineIsComment) {
          const trimedPrevLine = message.prevLine
            .trimStart()
            .slice(2)
            .trimStart();
          const styleStart = trimedPrevLine.indexOf("[");
          const styleEnd = trimedPrevLine.indexOf("]");
          message.hasStyleBrackets = Boolean(styleStart === 0 && styleEnd);
          if (message.hasStyleBrackets) {
            setExistingStyles(
              trimedPrevLine
                .slice(styleStart + 1, styleEnd)
                .split(",")
                .map((s) => s.trim()),
            );
          } else {
            setExistingStyles([]);
          }
        }
        const interactionElement = element.closest(".interaction");
        const classList = interactionElement?.classList;
        const signatureCtx = context?.messageBody?.()?.func?.()?.signature?.()?.[0];
        const asyncContent = context?.content?.();
        const creationParams = context?.creationBody?.()?.parameters?.();
        message.currentType = classList?.contains("return")
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
          message.labelStart = signatureCtx?.start.start ?? -1;
          message.labelEnd = signatureCtx?.stop.stop ?? -1;
        }
        setSelectedParticipants([]);
        setSelectedMessage({
          start: message.labelStart >= 0 ? message.labelStart : message.start,
          end: message.labelEnd >= 0 ? message.labelEnd : (context?.stop?.stop ?? message.start),
          token: Date.now(),
        });
        refs.setReference(element);
        setHasMessageContext(Boolean(context));
        setIsOpen(true);
      }, 0);
    });
  }, [code, refs, setOnMessageClick, setSelectedMessage, setSelectedParticipants]);

  useEffect(() => {
    if (!selectedMessage) {
      setIsOpen(false);
    }
  }, [selectedMessage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setIsOpen(false);
      setSelectedMessage(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSelectedMessage]);

  return (
    <div id="style-panel" ref={refs.setFloating} style={floatingStyles}>
      {isOpen && (
        <div className="flex items-center bg-white shadow-md z-10 rounded-md p-1 gap-1">
          <div className="flex">
            {btns.map((btn) => (
              <div onClick={() => handleClick(btn.class)} key={btn.name}>
                <div
                  className={cn(
                    "w-6 mx-1 py-1 rounded-md text-black text-center cursor-pointer hover:bg-gray-200",
                    [
                      btn.class,
                      { "bg-gray-100": existingStyles.includes(btn.class) },
                    ],
                  )}
                >
                  {btn.content}
                </div>
              </div>
            ))}
          </div>
          <div className="w-px self-stretch bg-gray-200" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-testid="message-rename"
              className={cn(
                "px-2 py-1 rounded-md text-[11px] uppercase tracking-wide text-black text-center cursor-pointer hover:bg-gray-200",
                {
                  "opacity-40 pointer-events-none":
                    messageData.current.labelStart < 0 ||
                    messageData.current.labelEnd < 0,
                },
              )}
              onClick={handleRenameClick}
            >
              Rename
            </button>
          </div>
          <div className="w-px self-stretch bg-gray-200" />
          <div className="flex items-center gap-1 pr-1">
            {(["sync", "async", "return"] as MessageArrowType[]).map((type) => (
              <div
                key={type}
                onClick={() => handleTypeClick(type)}
              >
                <div
                  data-testid={`message-type-${type}`}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] uppercase tracking-wide text-black text-center cursor-pointer hover:bg-gray-200",
                    {
                      "bg-gray-100": messageData.current.currentType === type,
                      "opacity-40 pointer-events-none": !canTransformMessageType({
                        line: messageData.current.line,
                        currentType: messageData.current.currentType,
                        targetType: type,
                        source: messageData.current.source,
                        target: messageData.current.target,
                        signature: messageData.current.signature,
                      }),
                    },
                  )}
                >
                  {type}
                </div>
              </div>
            ))}
          </div>
          <div className="w-px self-stretch bg-gray-200" />
          <div className="flex items-center gap-1 pr-1">
            {wrapTypes.map((type) => (
              <button
                type="button"
                key={type}
                data-testid={`message-wrap-${type}`}
                className="px-2 py-1 rounded-md text-[11px] uppercase tracking-wide text-black text-center cursor-pointer hover:bg-gray-200"
                onClick={() => handleWrapClick(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
