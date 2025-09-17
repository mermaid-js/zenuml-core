import { cn } from "@/utils";
import { getLineHead, getPrevLine, getPrevLineHead } from "@/utils/StringUtil";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  codeAtom,
  onContentChangeAtom,
  onMessageClickAtom,
} from "@/store/Store";
import { useEffect, useRef, useState } from "react";
import { useFloating } from "@floating-ui/react";
import { useOutsideClick } from "@/functions/useOutsideClick";
// No parser or CodeRange dependency in the click path

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

export const StylePanel = () => {
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const setOnMessageClick = useSetAtom(onMessageClickAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [existingStyles, setExistingStyles] = useState<string[]>([]);
  const [hasSelection, setHasSelection] = useState(false);

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
  });

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const handleClick = (style: string) => {
    setIsOpen(false);
    if (!hasSelection) return;
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

  useOutsideClick(refs.floating.current, () => {
    setIsOpen(false);
  });

  useEffect(() => {
    setOnMessageClick((startOffset: number, element: HTMLElement) => {
      // make sure this is triggered after the outsideclicking
      setTimeout(() => {
        const message = messageData.current;
        // Require startOffset; don't fallback
        if (typeof startOffset !== "number") {
          console.warn("[stylepanel] missing startOffset/codeRange in payload; aborting");
          return;
        }
        message.start = startOffset;

        message.lineHead = getLineHead(code, message.start);
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
        refs.setReference(element);
        setHasSelection(true);
        setIsOpen(true);
      }, 0);
    });
  }, [code, refs, setOnMessageClick]);

  return (
    <div id="style-panel" ref={refs.setFloating} style={floatingStyles}>
      {isOpen && (
        <div
          className="flex bg-white shadow-md z-10 rounded-md p-1"
          data-testid="style-panel-toolbar"
        >
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
      )}
    </div>
  );
};
