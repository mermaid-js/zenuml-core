import { cn } from "@/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  codeAtom,
  onContentChangeAtom,
  onMessageClickAtom,
} from "@/store/Store";
import { useEffect, useRef, useState } from "react";
import { useFloating } from "@floating-ui/react";
import { useOutsideClick } from "@/functions/useOutsideClick";
import { applyStylesAt, readStylesAt, toggleStyleList } from "./StylePanel.helpers";
import { offsetFromLineCol } from "@/utils/StringUtil";
import type { CodeRange } from "@/parser/CodeRange";
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

  const startRef = useRef<number>(0);

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const onToggleStyle = (style: string) => {
    setIsOpen(false);
    if (!hasSelection) return;

    // Recompute selection against the latest code to avoid using
    // stale cached data if the document changed while the panel was open.
    const start = startRef.current;
    const toggled = toggleStyleList(existingStyles, style);
    const newCode = applyStylesAt(code, start, toggled);
    updateCode(newCode);
  };

  useOutsideClick(refs.floating.current, () => {
    setIsOpen(false);
  });

  useEffect(() => {
    setOnMessageClick((range: CodeRange, element: HTMLElement) => {
      // Run on the next tick so useOutsideClick can close any previous panel first
      setTimeout(() => {
        const startOffset = offsetFromLineCol(code, range.start.line, range.start.col);
        const styles = readStylesAt(code, startOffset);
        startRef.current = startOffset;
        setExistingStyles(styles);
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
            <div onClick={() => onToggleStyle(btn.class)} key={btn.name}>
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
