import CommentVM from "@/components/Comment/Comment";

export const getCommentHeight = (context: any): number => {
  if (!context?.getComment) return 0;
  const rawComment = context.getComment() || "";
  if (!rawComment) return 0;
  return new CommentVM(rawComment).getHeight();
};
