import { useAtom, useAtomValue } from "jotai";
import {
  codeAtom,
  modeAtom,
  onContentChangeAtom,
  pendingEditableRangeAtom,
  RenderMode,
} from "@/store/Store";
import { specialCharRegex } from "@/utils/messageNormalizers";
import { EditableSpan } from "@/components/common/EditableSpan";
import { resolveEmojiInText } from "@/emoji/resolveEmoji";
import { useSetAtom } from "jotai";

const equalityRegex = /\b(\w+)\s*==\s*(\w+)\b/g;

export const ConditionLabel = (props: { condition: any }) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const pendingEditableRange = useAtomValue(pendingEditableRangeAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);
  const labelText = props.condition?.getFormattedText() ?? "";
  const isEditable = mode === RenderMode.Dynamic;
  const [start, end] = [
    props.condition?.start?.start,
    props.condition?.stop?.stop,
  ];
  const shouldAutoEdit =
    pendingEditableRange?.start === start && pendingEditableRange?.end === end
      ? pendingEditableRange.token
      : undefined;

  const handleSave = (newText: string) => {
    // if text is empty, bail out
    if (newText === "" || newText === labelText) {
      return;
    }

    let processedText = newText;

    // If text has special characters, not an equality condition, we wrap it with double quotes
    if (specialCharRegex.test(processedText) && !equalityRegex.test(processedText)) {
      processedText = processedText.replace(/"/g, ""); // remove existing double quotes
      processedText = `"${processedText}"`;
    }

    if (start === -1 || end === -1) {
      console.warn("labelPosition is not set");
      return;
    }
    const newCode = code.slice(0, start) + processedText + code.slice(end + 1);
    setCode(newCode);
    onContentChange(newCode);
    if (shouldAutoEdit) {
      setPendingEditableRange(null);
    }
  };

  return (
    <>
      <label>[</label>
      <EditableSpan
        text={resolveEmojiInText(labelText)}
        isEditable={isEditable}
        className="bg-skin-frame opacity-65 condition"
        onSave={handleSave}
        title="Double-click to edit"
        autoEditToken={shouldAutoEdit}
      />
      <label>]</label>
    </>
  );
};
