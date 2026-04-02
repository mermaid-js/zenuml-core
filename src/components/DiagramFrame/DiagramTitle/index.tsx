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
    if (trimmed === displayTitle) return;

    if (props.context) {
      const contentStart = props.context.start.start + "title ".length;
      const contentEnd = props.context.stop.stop;
      const newCode =
        code.slice(0, contentStart) + trimmed + code.slice(contentEnd + 1);
      setCode(newCode);
      onContentChange(newCode);
    } else {
      if (!trimmed) return;
      const newCode = `title ${trimmed}\n${code}`;
      setCode(newCode);
      onContentChange(newCode);
    }
  };

  return (
    <div className="title text-skin-title text-base font-semibold">
      {isEditable ? (
        <EditableSpan
          text={hasTitle ? displayTitle : PLACEHOLDER}
          isEditable={true}
          onSave={handleSave}
          title={hasTitle ? "Click to edit title" : "Click to add title"}
          className={hasTitle ? "" : "text-gray-400 italic font-normal text-sm"}
          selectAllOnEdit={!hasTitle}
        />
      ) : (
        <span>{displayTitle}</span>
      )}
    </div>
  );
};
