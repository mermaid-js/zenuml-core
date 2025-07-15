import { codeAtom, modeAtom, onContentChangeAtom } from "@/store/Store";
import { cn } from "@/utils";
import { useAtom, useAtomValue } from "jotai";
import { formatText } from "@/utils/StringUtil";
import { useEditLabelImproved, specialCharRegex } from "@/functions/useEditLabel";
import { RenderMode } from "@/store/Store";
import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import "../LifeLineLayer/EditableLabel.css";

export const MessageLabel = (props: {
  labelText: string;
  labelPosition: [number, number];
  isAsync?: boolean;
  isSelf?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const formattedLabelText = formatText(props.labelText);

  const replaceLabelText = (e: FocusEvent | KeyboardEvent | MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    let newText = target.innerText.trim() ?? "";

    // If text is empty or same as the original label text,
    // we replace it with the original label text and bail out early
    if (newText === "" || newText === props.labelText) {
      target.innerText = props.labelText;
      return;
    }

    if (newText.includes(" ")) {
      newText = newText.replace(/\s+/g, " "); // remove extra spaces
    }

    // If text has special characters or space, we wrap it with double quotes
    // *NOTE*: We don't wrap the text with  quotes if it's an async message
    if (!props.isAsync && specialCharRegex.test(newText)) {
      newText = newText.replace(/"/g, ""); // remove existing double quotes
      newText = `"${newText}"`;
      specialCharRegex.lastIndex = 0;
    }

    const [start, end] = props.labelPosition;
    if (start === -1 || end === -1) {
      console.warn("labelPosition is not set");
      return;
    }

    const newCode = code.slice(0, start) + newText + code.slice(end + 1);
    setCode(newCode);
    onContentChange(newCode);
  };
  const labelHandler = useEditLabelImproved(replaceLabelText, {
    singleClick: true,
    showHoverHint: true
  });

  return (
    <label
      title="Click to edit"
      className={labelHandler.getEditableClasses(
        cn("px-1 right", props.className)
      )}
      style={props.style}
      contentEditable={labelHandler.editing && mode === RenderMode.Dynamic}
      suppressContentEditableWarning={true}
      onClick={labelHandler.handleClick}
      onDoubleClick={labelHandler.handleDoubleClick}
      onMouseEnter={labelHandler.handleMouseEnter}
      onMouseLeave={labelHandler.handleMouseLeave}
      onBlur={labelHandler.handleBlur}
      onKeyUp={labelHandler.handleKeyup}
      onKeyDown={labelHandler.handleKeydown}
    >
      {formattedLabelText}
    </label>
  );
};
