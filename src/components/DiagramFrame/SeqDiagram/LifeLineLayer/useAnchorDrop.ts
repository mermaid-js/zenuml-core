import { codeAtom, dragAnchorAtom, onContentChangeAtom } from "@/store/Store";
import {
  getCurrentLine,
  getLeadingSpaces,
  getLineTail,
  getPrevLine,
  getPrevNotCommentLineTail,
} from "@/utils/StringUtil";
import { useAtom, useAtomValue } from "jotai";

const DEFAULT_INDENT = "  ";

export const useAnchorDrop = (entity: string) => {
  const [code, setCode] = useAtom(codeAtom);
  const dragAnchor = useAtomValue(dragAnchorAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const handleDrop = () => {
    if (!dragAnchor) return;
    let newCode = code;
    const messageContent = `${entity}."${dragAnchor.id}"`;
    if (typeof dragAnchor.index !== "number") {
      const braces = dragAnchor.context?.braceBlock?.();
      if (braces) {
        console.log(braces);
        // insert new message inside empty braces
        const prev = code.slice(0, braces.start.start);
        const next = code.slice(braces.stop.stop + 1);
        const leadingSpaces = getLeadingSpaces(
          getCurrentLine(code, braces.start.start),
        );
        newCode = `${prev}{\n${leadingSpaces}${DEFAULT_INDENT}${messageContent}\n${leadingSpaces}}${next}`;
      } else {
        // insert new message with new braces
        const start = dragAnchor.context.children[0]?.start?.start;
        const insertPosition = getLineTail(code, start);
        const prev = code.slice(0, insertPosition);
        const next = code.slice(insertPosition);
        const leadingSpaces = getLeadingSpaces(
          getPrevLine(code, insertPosition + 1),
        );
        newCode = `${prev} {\n${leadingSpaces}${DEFAULT_INDENT}${messageContent}\n${leadingSpaces}}${next}`;
      }
    } else if (dragAnchor.index < dragAnchor.context.children.length) {
      // insert new message inside a block
      const start = dragAnchor.context.children[dragAnchor.index]?.start?.start;
      const insertPosition = getPrevNotCommentLineTail(code, start) + 1;
      const prev = code.slice(0, insertPosition);
      const next = code.slice(insertPosition);
      newCode = `${prev}${getLeadingSpaces(next)}${messageContent}\n${next}`;
    } else {
      // insert new message at the end of a block
      const start =
        dragAnchor.context.children.at(-1)?.stop?.stop || code.length;
      const insertPosition = getLineTail(code, start);
      const prev = code.slice(0, insertPosition);
      const next = code.slice(insertPosition);
      const leadingSpaces = getLeadingSpaces(
        getCurrentLine(code, insertPosition),
      );
      newCode = `${prev}\n${leadingSpaces}${messageContent}\n${next}`;
    }
    setCode(newCode);
    onContentChange(newCode);
  };

  return { handleDrop };
};
