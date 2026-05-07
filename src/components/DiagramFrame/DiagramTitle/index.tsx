import { resolveEmojiInText } from "@/emoji/resolveEmoji";
import { EditableSpan } from "@/components/common/EditableSpan";
import { codeAtom, modeAtom, onContentChangeAtom, RenderMode } from "@/store/Store";
import { useAtom, useAtomValue } from "jotai";

export const DiagramTitle = (props: { context: any }) => {
  const mode = useAtomValue(modeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);

  const PLACEHOLDER = "Click to add title";

  const rawTitle = props.context?.content();
  const displayTitle = rawTitle ? resolveEmojiInText(rawTitle) : "";
  const isEditable = mode !== RenderMode.Static;
  const hasTitle = Boolean(displayTitle);

  const handleSave = (newText: string) => {
    const sanitized = newText === PLACEHOLDER ? "" : newText.replace(/[\r\n]+/g, " ");
    const trimmed = sanitized.trim();
    if (trimmed === displayTitle || !trimmed) return;

    if (props.context) {
      const contentStart = props.context.start.start + "title ".length;
      const contentEnd = props.context.stop.stop;
      const newCode =
        code.slice(0, contentStart) + trimmed + code.slice(contentEnd + 1);
      setCode(newCode);
      onContentChange(newCode);
    } else {
      const newCode = `title ${trimmed}\n${code}`;
      setCode(newCode);
      onContentChange(newCode);
    }
  };

  return (
    <div className={`title text-skin-title text-base font-semibold${!hasTitle && isEditable ? " group min-w-[8rem]" : ""}`}>
      {isEditable ? (
        <EditableSpan
          text={hasTitle ? displayTitle : PLACEHOLDER}
          isEditable={true}
          onSave={handleSave}
          title={hasTitle ? "Click to edit title" : "Click to add title"}
          className={hasTitle ? "!p-0" : "!p-0 text-gray-400 italic font-normal text-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"}
          selectAllOnEdit={!hasTitle}
        />
      ) : (
        <span>{displayTitle}</span>
      )}
    </div>
  );
};
