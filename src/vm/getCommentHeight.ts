import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";

export const getCommentHeight = (
  context: any,
  markdown: MarkdownMeasurer,
): number => {
  if (!context?.getComment) return 0;
  const rawComment = context.getComment() || "";
  if (!rawComment) return 0;
  return markdown.measure(rawComment);
};
