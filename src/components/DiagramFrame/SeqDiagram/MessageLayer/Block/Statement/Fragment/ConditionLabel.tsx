import { cn } from "@/utils";
import { useEditLabel, specialCharRegex } from "@/functions/useEditLabel";
import { useAtom, useAtomValue } from "jotai";
import { codeAtom, modeAtom, RenderMode } from "@/store/Store";

const equalityRegex = /\b(\w+)\s*==\s*(\w+)\b/g;

export const ConditionLabel = (props: { condition: any }) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const labelText = props.condition?.getFormattedText() ?? "";
  const { editing, handleDblClick, handleBlur, handleKeydown, handleKeyup } =
    useEditLabel((e) => {
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
      setCode(code.slice(0, start) + newText + code.slice(end + 1));
    });

  return (
    <>
      <label>[</label>
      <label
        title="Double click to edit"
        className={cn(
          "bg-skin-frame opacity-65 condition px-1 cursor-text hover:text-skin-message-hover hover:bg-skin-message-hover",
          {
            "cursor-text": editing,
          },
        )}
        contentEditable={editing && mode === RenderMode.Dynamic}
        onDoubleClick={handleDblClick}
        onBlur={handleBlur}
        onKeyUp={handleKeyup}
        onKeyDown={handleKeydown}
      >
        {labelText}
      </label>
      <label>]</label>
    </>
  );
};
