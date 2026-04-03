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
  const displayText = props.assignee
    ? `${props.assignee}:${props.labelText}`
    : props.labelText;

  const normalizeEditableText = (text: string) => {
    let processedText = text;

    if (processedText.includes(" ")) {
      processedText = processedText.replace(/\s+/g, " ");
    }

    if (specialCharRegex.test(processedText)) {
      processedText = processedText.replace(/"/g, "");
      processedText = `"${processedText}"`;
      specialCharRegex.lastIndex = 0;
    }

    return processedText;
  };

  const replaceCodeAtPositions = (
    replacements: Array<{ positions: Array<Position>; text: string }>,
  ) => {
    const edits = replacements
      .flatMap(({ positions, text }) =>
        positions.map((position) => ({
          position,
          text: normalizeEditableText(text),
        })),
      )
      .sort((a, b) => b.position[0] - a.position[0]);

    if (edits.length === 0) return;

    let newCode = code;
    for (const { position, text } of edits) {
      const [start, end] = position;
      newCode = newCode.slice(0, start) + text + newCode.slice(end);
    }

    setCode(newCode);
    onContentChange(newCode);
  };

  const createSaveHandler = (positions: Array<Position>, originalText: string) => {
    return (newText: string) => {
      // If text is empty or same as the original label text, bail out
      if (newText === "" || newText === originalText) {
        return;
      }

      replaceCodeAtPositions([{ positions, text: newText }]);
    };
  };

  const createCombinedSaveHandler = (originalText: string) => {
    return (newText: string) => {
      if (newText === "" || newText === originalText) {
        return;
      }

      let nextAssignee = props.assignee ?? "";
      let nextLabel = newText;
      const separatorIndex = newText.indexOf(":");

      if (separatorIndex >= 0) {
        const parsedAssignee = newText.slice(0, separatorIndex).trim();
        const parsedLabel = newText.slice(separatorIndex + 1).trim();

        if (parsedAssignee) {
          nextAssignee = parsedAssignee;
        }
        if (parsedLabel) {
          nextLabel = parsedLabel;
        } else {
          nextLabel = props.labelText;
        }
      }

      replaceCodeAtPositions([
        { positions: props.assigneePositions ?? [], text: nextAssignee },
        { positions: props.labelPositions ?? [], text: nextLabel },
      ]);
    };
  };

  return (
    <div className="flex items-center justify-center">
      <EditableSpan
        text={displayText}
        isEditable={props.assignee ? assigneeIsEditable : participantIsEditable}
        className={cn("name leading-4 right px-1")}
        onSave={
          props.assignee
            ? createCombinedSaveHandler(displayText)
            : createSaveHandler(props.labelPositions ?? [], props.labelText)
        }
        title={props.assignee ? "Click to rename variable" : "Click to rename participant"}
      />
    </div>
  );
};
