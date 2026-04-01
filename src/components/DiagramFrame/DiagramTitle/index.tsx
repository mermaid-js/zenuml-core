import { resolveEmojiInText } from "@/emoji/resolveEmoji";

export const DiagramTitle = (props: { context: any }) => {
  const rawTitle = props.context?.content();
  const title = rawTitle ? resolveEmojiInText(rawTitle) : rawTitle;
  return (
    <div className="title text-skin-title text-base font-semibold">{title}</div>
  );
};
