import { resolveEmojiInText } from "@/emoji/resolveEmoji";
import { EditableSpan } from "@/components/common/EditableSpan";
import { codeAtom, modeAtom, RenderMode } from "@/store/Store";
import { useAtomValue } from "jotai";
import { useCommitCode } from "@/store/useCommitCode";
import { useTextEditingGuard } from "@/components/common/EditableSpan/useTextEditingGuard";

export const DiagramTitle = (props: { context: any }) => {
  const mode = useAtomValue(modeAtom);
  const code = useAtomValue(codeAtom);
  const commitCode = useCommitCode();
  const updateTextEditing = useTextEditingGuard();

  const PLACEHOLDER = "Click to add title";

  const rawTitle = props.context?.content();
  const displayTitle = rawTitle ? resolveEmojiInText(rawTitle) : "";
  const isEditable = mode !== RenderMode.Static;
  const hasTitle = Boolean(displayTitle);

  // Not built on EditableLabelField: the title has no label range to splice.
  // It edits the `title` token, or inserts a new first line when there is none.
  const handleSave = (newText: string) => {
    const sanitized =
      newText === PLACEHOLDER ? "" : newText.replace(/[\r\n]+/g, " ");
    const trimmed = sanitized.trim();
    if (trimmed === displayTitle || !trimmed) return;

    if (props.context) {
      // The `title` rule spans `TITLE TITLE_CONTENT? TITLE_END?`, so its stop
      // token may be the line break. Replace only the content token so the
      // newline after the title survives the edit. TITLE_CONTENT also carries
      // the whitespace around the text: keep the separator after `title`,
      // drop any trailing spaces.
      const contentToken = props.context.TITLE_CONTENT()?.symbol;
      const titleEnd = props.context.TITLE().symbol.stop + 1;
      const tokenText: string = contentToken?.text ?? "";
      const leading = tokenText.length - tokenText.trimStart().length;
      const contentStart = contentToken
        ? contentToken.start + leading
        : titleEnd;
      const contentEnd = contentToken ? contentToken.stop + 1 : titleEnd;
      const replacement = (leading > 0 ? "" : " ") + trimmed;
      const newCode =
        code.slice(0, contentStart) + replacement + code.slice(contentEnd);
      commitCode(newCode, { action: "title_edited", label: "changed" });
    } else {
      const newCode = `title ${trimmed}\n${code}`;
      commitCode(newCode, { action: "title_edited", label: "added" });
    }
  };

  return (
    <div
      className={`title text-skin-title text-sm font-normal${!hasTitle && isEditable ? " group min-w-[8rem]" : ""}`}
    >
      {isEditable ? (
        <EditableSpan
          text={hasTitle ? displayTitle : PLACEHOLDER}
          isEditable={true}
          onSave={handleSave}
          onEditingChange={updateTextEditing}
          title={hasTitle ? "Click to edit title" : "Click to add title"}
          className={
            hasTitle
              ? "!p-0"
              : "!p-0 text-gray-400 italic font-normal text-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          }
          selectAllOnEdit={!hasTitle}
        />
      ) : (
        <span>{displayTitle}</span>
      )}
    </div>
  );
};
