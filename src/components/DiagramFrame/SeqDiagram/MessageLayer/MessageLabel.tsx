import { codeAtom, modeAtom, onContentChangeAtom } from "@/store/Store";
import { cn } from "@/utils";
import { useAtom, useAtomValue } from "jotai";
import { formatText } from "@/utils/StringUtil";
import { EditableSpan } from "@/components/common/EditableSpan";
import { RenderMode } from "@/store/Store";

export const MessageLabel = (props: {
  labelText: string;
  labelPosition: [number, number];
  normalizeText?: (text: string) => string;
  className?: string;
}) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const formattedLabelText = formatText(props.labelText ?? "");
  const isEditable = mode === RenderMode.Dynamic;

  const handleSave = (newText: string) => {
    // If text is empty or same as the original label text, bail out
    if (newText === "" || newText === props.labelText) {
      return;
    }

    // Apply parent-provided normalizer
    const normalizedText = props.normalizeText?.(newText) ?? newText;

    const [start, end] = props.labelPosition;
    if (start === -1 || end === -1) {
      console.warn("labelPosition is not set");
      return;
    }

    const newCode = code.slice(0, start) + normalizedText + code.slice(end + 1);
    setCode(newCode);
    onContentChange(newCode);
  };

  return (
    <EditableSpan
      text={formattedLabelText}
      isEditable={isEditable}
      className={cn("px-1 right", props.className)}
      onSave={handleSave}
      title="Double-click to edit"
    />
  );
};
