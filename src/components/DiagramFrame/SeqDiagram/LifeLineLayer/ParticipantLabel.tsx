import {
  codeAtom,
  modeAtom,
  onContentChangeAtom,
  RenderMode,
} from "@/store/Store";
import { useAtom, useAtomValue } from "jotai";
import { Position } from "@/parser/Participants";
import { specialCharRegex } from "@/utils/messageNormalizers";
import { cn } from "@/utils";
import { EditableSpan } from "@/components/common/EditableSpan";

const UneditableText = ["Missing Constructor", "ZenUML"];

export const ParticipantLabel = (props: {
  labelText: string;
  labelPositions?: Array<[number, number]>;
  assignee?: string;
  assigneePositions?: Array<[number, number]>;
}) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const participantIsEditable =
    mode === RenderMode.Dynamic &&
    UneditableText.indexOf(props.labelText) === -1;
  const assigneeIsEditable = mode === RenderMode.Dynamic;

  const createSaveHandler = (positions: Array<Position>, originalText: string) => {
    return (newText: string) => {
      // If text is empty or same as the original label text, bail out
      if (newText === "" || newText === originalText) {
        return;
      }

      let processedText = newText;

      if (processedText.includes(" ")) {
        processedText = processedText.replace(/\s+/g, " "); // remove extra spaces
      }

      // If text has special characters or space, we wrap it with double quotes
      if (specialCharRegex.test(processedText)) {
        processedText = processedText.replace(/"/g, ""); // remove existing double quotes
        processedText = `"${processedText}"`;
        specialCharRegex.lastIndex = 0;
      }

      if (!positions || positions.length === 0) return;

      let newCode = code;
      for (const position of positions) {
        const [start, end] = position;
        newCode = newCode.slice(0, start) + processedText + newCode.slice(end);
      }
      setCode(newCode);
      onContentChange(newCode);
    };
  };

  return (
    <div className="flex items-center justify-center">
      {props.assignee && (
        <>
          <EditableSpan
            text={props.assignee}
            isEditable={assigneeIsEditable}
            className="name pl-1 leading-4 right"
            onSave={createSaveHandler(props.assigneePositions ?? [], props.assignee)}
            title="Double-click to edit"
          />
          <span>:</span>
        </>
      )}
      <EditableSpan
        text={props.labelText}
        isEditable={participantIsEditable}
        className={cn(
          "name leading-4 right",
          props.assignee ? "pr-1" : "px-1"
        )}
        onSave={createSaveHandler(props.labelPositions ?? [], props.labelText)}
        title="Double-click to edit"
      />
    </div>
  );
};
