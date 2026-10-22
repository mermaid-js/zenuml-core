import CommentClass from "@/components/Comment/Comment";
import { cn } from "@/utils";
import { markdownToReact } from "./markdownToReact";

export const Comment = (props: {
  comment?: any;
  commentObj?: CommentClass;
  className?: string;
}) => {
  const text = props.commentObj?.text || props.comment;

  return (
    <div
      className={cn(
        "comments text-skin-comment min-w-[100px] flex text-left opacity-skin-comment hover:opacity-100",
        props.className,
      )}
    >
      <div
        className={cn(props.commentObj?.commentClassNames)}
        style={props.commentObj?.commentStyle}
      >
        {text ? markdownToReact(text) : null}
      </div>
    </div>
  );
};
