import { codeAtom, modeAtom, onContentChangeAtom } from "@/store/Store";
import { cn } from "@/utils";
import { useAtom, useAtomValue } from "jotai";
import { formatText } from "@/utils/StringUtil";
import { EditableSpan } from "@/components/common/EditableSpan";
import { RenderMode } from "@/store/Store";

export interface AssignmentReturnLabelProps {
  assignee: string;
  type: string;
  assigneePosition: [number, number];
  typePosition: [number, number];
  normalizeText?: (text: string) => string;
  className?: string;
}

export const AssignmentReturnLabel = ({
  assignee,
  type,
  assigneePosition,
  typePosition,
  normalizeText,
  className,
}: AssignmentReturnLabelProps) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const isEditable = mode !== RenderMode.Static;

  const formattedAssignee = formatText(assignee ?? "");
  const formattedType = formatText(type ?? "");

  const handleAssigneeSave = (newText: string) => {
    // If text is empty or same as the original assignee, bail out
    if (newText === "" || newText === assignee) {
      return;
    }

    // Apply parent-provided normalizer (assignee needs normalization like quotes)
    const normalizedText = normalizeText?.(newText) ?? newText;

    const [start, end] = assigneePosition;
    if (start === -1 || end === -1) {
      console.warn("assigneePosition is not set");
      return;
    }

    const newCode = code.slice(0, start) + normalizedText + code.slice(end + 1);
    setCode(newCode);
    onContentChange(newCode);
  };

  const handleTypeSave = (newText: string) => {
    // If text is empty or same as the original type, bail out
    if (newText === "" || newText === type) {
      return;
    }

    // Type typically doesn't need normalization (it's a type identifier)
    const [start, end] = typePosition;
    if (start === -1 || end === -1) {
      console.warn("typePosition is not set");
      return;
    }

    const newCode = code.slice(0, start) + newText + code.slice(end + 1);
    setCode(newCode);
    onContentChange(newCode);
  };

  return (
    <span className={cn("assignment-return-label", className)}>
      <EditableSpan
        text={formattedAssignee}
        isEditable={isEditable}
        className="right"
        onSave={handleAssigneeSave}
        title="Double-click to edit assignee"
      />
      {type && (
        <>
          <span className="text-skin-message">:</span>
          <EditableSpan
            text={formattedType}
            isEditable={isEditable}
            className="right"
            onSave={handleTypeSave}
            title="Double-click to edit type"
          />
        </>
      )}
    </span>
  );
};
