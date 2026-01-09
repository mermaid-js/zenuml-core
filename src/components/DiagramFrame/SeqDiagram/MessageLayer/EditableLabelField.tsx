import { codeAtom, modeAtom, onContentChangeAtom } from "@/store/Store";
import { cn } from "@/utils";
import { useAtom, useAtomValue } from "jotai";
import { formatText } from "@/utils/StringUtil";
import { EditableSpan } from "@/components/common/EditableSpan";
import { RenderMode } from "@/store/Store";

interface EditableLabelFieldProps {
  text: string;
  position: [number, number];
  normalizeText?: (text: string) => string;
  className?: string;
  title?: string;
}

export const EditableLabelField = ({
  text,
  position,
  normalizeText,
  className,
  title = "Double-click to edit",
}: EditableLabelFieldProps) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const isEditable = mode !== RenderMode.Static;
  const formattedText = formatText(text ?? "");

  const handleSave = (newText: string) => {
    // If text is empty or same as the original text, bail out
    if (newText === "" || newText === text) {
      return;
    }

    // Apply parent-provided normalizer
    const normalizedText = normalizeText?.(newText) ?? newText;

    const [start, end] = position;
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
      text={formattedText}
      isEditable={isEditable}
      className={cn(className)}
      onSave={handleSave}
      title={title}
    />
  );
};
