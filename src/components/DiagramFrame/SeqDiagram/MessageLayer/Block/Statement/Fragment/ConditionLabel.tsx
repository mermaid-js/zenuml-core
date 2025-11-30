import { useEditLabelImproved, specialCharRegex } from "@/functions/useEditLabel";
import { useAtom, useAtomValue } from "jotai";
import "../../../../LifeLineLayer/EditableLabel.css";
import {
  codeAtom,
  modeAtom,
  onContentChangeAtom,
  RenderMode,
} from "@/store/Store";

const equalityRegex = /\b(\w+)\s*==\s*(\w+)\b/g;

export const ConditionLabel = (props: { condition: any }) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const labelText = props.condition?.getFormattedText() ?? "";
  const labelHandler = useEditLabelImproved((e) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      let newText = target.innerText.trim() ?? "";

      // if text is empty, we need to replace it with the original condition text
      if (newText === "") {
        target.innerText = labelText;
        return;
      }

      // If text has special characters, not an equalitiy condition, we wrap it with double quotes
      if (specialCharRegex.test(newText) && !equalityRegex.test(newText)) {
        newText = newText.replace(/"/g, ""); // remove existing double quotes
        newText = `"${newText}"`;
      }

      const [start, end] = [
        props.condition?.start?.start,
        props.condition?.stop?.stop,
      ];
      if (start === -1 || end === -1) {
        console.warn("labelPosition is not set");
        return;
      }
      const newCode = code.slice(0, start) + newText + code.slice(end + 1);
      setCode(newCode);
      onContentChange(newCode);
    }, { showHoverHint: true, isEditable: mode === RenderMode.Dynamic });

  return (
    <>
      <label>[</label>
      <label
        title="Double-click to edit"
        className={labelHandler.getEditableClasses(
          "bg-skin-frame opacity-65 condition"
        )}
        contentEditable={labelHandler.editing && mode === RenderMode.Dynamic}
        suppressContentEditableWarning={true}
        onDoubleClick={labelHandler.handleDoubleClick}
        onMouseEnter={labelHandler.handleMouseEnter}
        onMouseLeave={labelHandler.handleMouseLeave}
        onBlur={labelHandler.handleBlur}
        onKeyUp={labelHandler.handleKeyup}
        onKeyDown={labelHandler.handleKeydown}
      >
        {labelText}
      </label>
      <label>]</label>
    </>
  );
};
