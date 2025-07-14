import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { Block } from "../../Block";
import { cn } from "@/utils";
import Icon from "@/components/Icon/Icons";
import { FragmentLayout } from "@/domain/models/DiagramLayout";

export const FragmentOpt = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  layoutData?: FragmentLayout;
}) => {
  const opt = props.context.opt();
  const {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    border,
    leftParticipant,
  } = useFragmentData(props.context, props.origin);

  // Determine if using new or old architecture
  const isNewArchitecture = !!props.layoutData;
  
  // Extract data based on architecture
  const data = isNewArchitecture
    ? {
        collapsed: props.layoutData!.collapsed,
        toggleCollapse: () => {}, // TODO: Implement collapse functionality in new architecture
        paddingLeft: props.layoutData!.paddingLeft,
        fragmentStyle: props.layoutData!.fragmentStyle,
        border: props.layoutData!.border,
        leftParticipant: props.layoutData!.leftParticipant,
        block: props.layoutData!.block,
      }
    : {
        collapsed,
        toggleCollapse,
        paddingLeft,
        fragmentStyle,
        border,
        leftParticipant,
        block: opt?.braceBlock()?.block(),
      };

  return (
    <div
      data-origin={props.origin}
      data-left-participant={data.leftParticipant}
      data-frame-padding-left={data.border.left}
      data-frame-padding-right={data.border.right}
      className={cn(
        "group fragment opt border-skin-fragment rounded",
        props.className,
      )}
      style={data.fragmentStyle}
    >
      {props.commentObj?.text && (
        <Comment comment={props.comment} commentObj={props.commentObj} />
      )}
      <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 relative">
        <Numbering number={props.number} />
        <div className="name font-semibold p-1 border-b">
          <label className="p-0 flex items-center gap-0.5">
            <Icon name="opt-fragment" />
            <CollapseButton
              label="Opt"
              collapsed={data.collapsed}
              onClick={data.toggleCollapse}
              style={props.commentObj?.textStyle}
              className={cn(props.commentObj?.classNames)}
            />
          </label>
        </div>
      </div>
      <Block
        origin={data.leftParticipant}
        className={cn({ hidden: data.collapsed })}
        style={{ paddingLeft: `${data.paddingLeft}px` }}
        context={data.block}
        number={`${props.number}.1`}
        incremental
      />
    </div>
  );
};
