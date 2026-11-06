import { cn } from "@/utils";
import {
  EditableLabelField,
  useReselectSavedMessage,
} from "./EditableLabelField";

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
  const reselect = useReselectSavedMessage();
  return (
    <span className={cn("assignment-return-label", className)}>
      <EditableLabelField
        text={assignee}
        position={assigneePosition}
        normalizeText={normalizeText}
        afterSave={reselect}
        className="right"
        title="Double-click to edit assignee"
      />
      {type && (
        <>
          <span className="text-skin-message">:</span>
          <EditableLabelField
            text={type}
            position={typePosition}
            afterSave={reselect}
            className="right"
            title="Double-click to edit type"
          />
        </>
      )}
    </span>
  );
};
