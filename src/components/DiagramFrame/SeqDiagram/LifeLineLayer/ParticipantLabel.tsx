import {
  codeAtom,
  modeAtom,
  onContentChangeAtom,
  RenderMode,
} from "@/store/Store";
import { useAtom, useAtomValue } from "jotai";
import { Position } from "@/parser/Participants";
import { useEditLabel, specialCharRegex } from "@/functions/useEditLabel";
import { SyntheticEvent } from "react";
import { cn } from "@/utils";

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

  const replaceLabelTextWithaPositions = (positions: Array<Position>) => {
    return function (e: SyntheticEvent) {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      let newText = target.innerText.trim() ?? "";

      // If text is empty or same as the original label text,
      // we replace it with the original label text and bail out early
      if (newText === "" || newText === props.labelText) {
        target.innerText = props.labelText;
        return;
      }

      if (newText.includes(" ")) {
        newText = newText.replace(/\s+/g, " "); // remove extra spaces
      }

      // If text has special characters or space, we wrap it with double quotes
      if (specialCharRegex.test(newText)) {
        newText = newText.replace(/"/g, ""); // remove existing double quotes
        newText = `"${newText}"`;
        specialCharRegex.lastIndex = 0;
      }

      if (!positions || positions.length === 0) return;

      let newCode = code;
      for (const position of positions) {
        const [start, end] = position;
        newCode = newCode.slice(0, start) + newText + newCode.slice(end);
      }
      setCode(newCode);
      onContentChange(newCode);
    };
  };

  const participantLabelHandler = useEditLabel(
    replaceLabelTextWithaPositions(props.labelPositions ?? []),
  );
  const assigneeLabelHandler = useEditLabel(
    replaceLabelTextWithaPositions(props.assigneePositions ?? []),
  );

  return (
    <div className="flex items-center justify-center">
      {props.assignee && (
        <>
          <label
            title="Double click to edit"
            className={cn(
              "name pl-1 leading-4 cursor-text right hover:text-skin-message-hover hover:bg-skin-message-hover",
              {
                "py-1 cursor-text": assigneeLabelHandler.editing,
              },
            )}
            contentEditable={
              assigneeLabelHandler.editing && mode === RenderMode.Dynamic
            }
            suppressContentEditableWarning={true}
            onDoubleClick={assigneeLabelHandler.handleDblClick}
            onBlur={assigneeLabelHandler.handleBlur}
            onKeyUp={assigneeLabelHandler.handleKeyup}
            onKeyDown={assigneeLabelHandler.handleKeydown}
          >
            {props.assignee}
          </label>
          <span>:</span>
        </>
      )}
      <label
        title="Double click to edit"
        className={cn(
          "name leading-4 cursor-text right hover:text-skin-message-hover hover:bg-skin-message-hover",
          props.assignee ? "pr-1" : "px-1",
          {
            "py-1 cursor-text": participantLabelHandler.editing,
          },
        )}
        contentEditable={
          participantLabelHandler.editing &&
          mode === RenderMode.Dynamic &&
          UneditableText.indexOf(props.labelText) === -1
        }
        suppressContentEditableWarning={true}
        onDoubleClick={participantLabelHandler.handleDblClick}
        onBlur={participantLabelHandler.handleBlur}
        onKeyUp={participantLabelHandler.handleKeyup}
        onKeyDown={participantLabelHandler.handleKeydown}
      >
        {props.labelText}
      </label>
    </div>
  );
};
