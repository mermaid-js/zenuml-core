import { codeAtom, modeAtom, onContentChangeAtom } from "@/store/Store";
import { cn } from "@/utils";
import { useAtom, useAtomValue } from "jotai";
import { formatText } from "@/utils/StringUtil";
import { EditableSpan } from "@/components/common/EditableSpan";
import { RenderMode } from "@/store/Store";

export interface CreationMessageLabelProps {
  labelText: string;
  labelPosition: [number, number];
  normalizeText?: (text: string) => string;
  className?: string;
}

export const CreationMessageLabel = ({
  labelText,
  labelPosition,
  normalizeText,
  className,
}: CreationMessageLabelProps) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const formattedLabelText = formatText(labelText ?? "");
  const isEditable = mode !== RenderMode.Static;

  const handleSave = (newText: string) => {
    // If text is empty or same as the original label text, bail out
    if (newText === "" || newText === labelText) {
      return;
    }

    // Apply parent-provided normalizer
    const normalizedText = normalizeText?.(newText) ?? newText;

    const [start, end] = labelPosition;
    if (start === -1 || end === -1) {
      console.warn("labelPosition is not set");
      return;
    }

    const newCode = code.slice(0, start) + normalizedText + code.slice(end + 1);
    setCode(newCode);
    onContentChange(newCode);
  };

  // In static/readonly mode, render plain text with default "create" if empty
  if (!isEditable) {
    return <>{`«${labelText || "create"}»`}</>;
  }

  if (!labelText) {
    return <>{`«create»`}</>;
  }
  // In editable mode, render with EditableSpan
  return (
    <>
      <span>«</span>
      <EditableSpan
        text={formattedLabelText}
        isEditable={isEditable}
        className={cn("right", className)}
        onSave={handleSave}
        title="Double-click to edit"
      />
      <span>»</span>
    </>
  );
};
