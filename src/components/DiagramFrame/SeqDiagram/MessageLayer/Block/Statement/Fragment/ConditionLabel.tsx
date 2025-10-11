import { useEditLabelImproved, specialCharRegex } from "@/functions/useEditLabel";
import { useAtom, useAtomValue } from "jotai";
import "../../../../LifeLineLayer/EditableLabel.css";
import { codeAtom, modeAtom, onContentChangeAtom, RenderMode } from "@/store/Store";
import type { ConditionVM } from "@/vm/fragment-types";

const equalityRegex = /\b(\w+)\s*==\s*(\w+)\b/g;

export const ConditionLabel = (props: { vm?: ConditionVM | null }) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  
  const conditionVM = props.vm || null;
  
  const labelText = conditionVM?.labelText || "";
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

      const [start, end] = conditionVM?.labelRange ?? [-1, -1];
      if (start === -1 || end === -1) {
        console.warn("labelPosition is not set");
        return;
      }
      const newCode = code.slice(0, start) + newText + code.slice(end + 1);
      setCode(newCode);
      onContentChange(newCode);
    }, { singleClick: true, showHoverHint: true });

  return (
    <>
      <label>[</label>
      <label
        title="Click to edit"
        className={labelHandler.getEditableClasses(
          "bg-skin-frame opacity-65 condition"
        )}
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
        {labelText}
      </label>
      <label>]</label>
    </>
  );
};
