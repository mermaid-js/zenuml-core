import type { ComponentProps, CSSProperties, ReactNode } from "react";
import CommentClass from "@/components/Comment/Comment";
import Icon from "@/components/Icon/Icons";
import { cn } from "@/utils";
import { Comment } from "../Comment/Comment";
import { CollapseButton } from "./CollapseButton";
import { FragmentNumbering } from "./FragmentNumbering";
import { useFragmentData } from "./useFragmentData";
import "./Fragment.css";

/** Layout values the frame hands to its body so the blocks line up with the frame. */
export interface FragmentFrameLayout {
  leftParticipant: string;
  paddingLeft: number;
}

/**
 * The shared chrome of an HTML fragment: the root `div` (with its layout
 * `data-*` attributes), the comment, the header (numbering, icon, collapse
 * button) and the collapsible body.
 */
export const FragmentFrame = (props: {
  /** The statement context (`stat`) of the fragment. */
  context: any;
  origin: string;
  /** Header text; also feeds the minimum width of the frame. */
  label: string;
  /** Icon name, e.g. `alt-fragment`. */
  icon: ComponentProps<typeof Icon>["name"];
  number?: string;
  comment?: string;
  commentObj?: CommentClass;
  /** Classes of the root `div`. */
  className: string;
  /** Classes appended to the base header classes. */
  headerClassName?: string;
  collapseStyle?: CSSProperties;
  collapseClassName?: string;
  /** Classes of the body while it is expanded. */
  expandedClassName?: string;
  children: (layout: FragmentFrameLayout) => ReactNode;
}) => {
  const {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    border,
    leftParticipant,
  } = useFragmentData(props.context, props.origin, {
    label: props.label,
    number: props.number,
  });

  return (
    <div
      data-origin={props.origin}
      data-left-participant={leftParticipant}
      data-frame-padding-left={border.left}
      data-frame-padding-right={border.right}
      className={props.className}
      style={fragmentStyle}
    >
      {props.commentObj?.text && (
        <Comment comment={props.comment} commentObj={props.commentObj} />
      )}
      <div
        className={cn(
          "header bg-skin-fragment-header text-skin-fragment-header leading-4",
          props.headerClassName ?? "rounded-t relative",
        )}
      >
        <div className="name font-normal p-1 border-b border-skin-fragment-header-rule">
          <label className="p-0 flex items-center gap-0.5 whitespace-nowrap">
            <FragmentNumbering number={props.number} />
            <Icon name={props.icon} />
            <CollapseButton
              label={props.label}
              collapsed={collapsed}
              onClick={toggleCollapse}
              style={props.collapseStyle}
              className={props.collapseClassName}
            />
          </label>
        </div>
      </div>
      <div className={collapsed ? "hidden" : props.expandedClassName}>
        {props.children({ leftParticipant, paddingLeft })}
      </div>
    </div>
  );
};
