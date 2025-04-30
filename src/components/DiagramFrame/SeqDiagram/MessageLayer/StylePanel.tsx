import { cn } from "@/utils";
import {
  Float,
  FloatVirtualInitialProps,
  useOutsideClick,
} from "@headlessui-float/react";
import { getLineHead, getPrevLine, getPrevLineHead } from "@/utils/StringUtil";
import { getElementDistanceToTop } from "@/utils/dom";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  codeAtom,
  diagramElementAtom,
  onMessageClickAtom,
} from "@/store/Store";
import { useState } from "react";

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
  const diagramElement = useAtomValue(diagramElementAtom);
  const setOnMessageClick = useSetAtom(onMessageClickAtom);
  const [messageContext, setMessageContext] = useState("");
  const [existingStyles, setExistingStyles] = useState<string[]>([]);

  let onClick: (style: string) => void = () => {};

  const onInitial = ({ show, setShow, refs }: FloatVirtualInitialProps) => {
    let start: number;
    let lineHead: number;
    let prevLine: string;
    let leadingSpaces: string;
    let prevLineIsComment: boolean;
    let hasStyleBrackets: boolean;
    setOnMessageClick((context: any, element: HTMLElement) => {
      start = context.value.start.start;
      lineHead = getLineHead(code, start);
      prevLine = getPrevLine(code, start);
      leadingSpaces = code.slice(lineHead).match(/^\s*/)?.[0] || "";
      prevLineIsComment = prevLine.trim().startsWith("//");
      if (prevLineIsComment) {
        const trimedPrevLine = prevLine.trimStart().slice(2).trimStart();
        const styleStart = trimedPrevLine.indexOf("[");
        const styleEnd = trimedPrevLine.indexOf("]");
        hasStyleBrackets = Boolean(styleStart === 0 && styleEnd);
        if (hasStyleBrackets) {
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
      setMessageContext(context);
      setShow(true);
    });

    // eslint-disable-next-line
    useOutsideClick(
      refs.floating,
      () => {
        setShow(false);
        setExistingStyles([]);
      },
      show,
    );

    onClick = (style: string) => {
      setShow(false);
      if (!messageContext) return;
      if (prevLineIsComment) {
        let newComment = "";
        if (hasStyleBrackets) {
          let updatedStyles;

          if (existingStyles.includes(style)) {
            updatedStyles = existingStyles.filter((s) => s !== style);
          } else {
            updatedStyles = [...existingStyles, style];
          }

          newComment = `${leadingSpaces}// [${updatedStyles
            .filter(Boolean)
            .join(", ")}] ${prevLine
            .slice(prevLine.indexOf("]") + 1)
            .trimStart()}`;
        } else {
          newComment = `${leadingSpaces}// [${style}] ${prevLine
            .slice((prevLine.match(/\/\/*/)?.index || -2) + 2)
            .trimStart()}`;
        }
        if (!newComment.endsWith("\n")) newComment += "\n";
        setCode(
          code.slice(0, getPrevLineHead(code, start)) +
            newComment +
            code.slice(lineHead),
        );
      } else {
        setCode(
          code.slice(0, lineHead) +
            `${leadingSpaces}// [${style}]\n` +
            code.slice(lineHead),
        );
      }
    };
  };

  return (
    <Float.Virtual
      key="tool"
      onInitial={onInitial}
      placement="top"
      offset={5}
      flip={{
        padding: getElementDistanceToTop(diagramElement!) + PARTICIPANT_HEIGHT,
      }}
      shift
      zIndex="30"
    >
      <div className="flex bg-white shadow-md z-10 rounded-md p-1">
        {btns.map((btn) => (
          <div onClick={() => onClick(btn.class)} key={btn.name}>
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
    </Float.Virtual>
  );
};
