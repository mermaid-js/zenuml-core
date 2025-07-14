import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { ConditionLabel } from "./ConditionLabel";
import { Block } from "../../Block";
import "./FragmentLoop.css";
import Icon from "@/components/Icon/Icons";
import { FragmentLayout } from "@/domain/models/DiagramLayout";

export const FragmentLoop = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  layoutData?: FragmentLayout;
}) => {
  const loop = props.context.loop();
  const blockInLoop = loop?.braceBlock()?.block();
  const condition = loop?.parExpr()?.condition();
  
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
        condition: props.layoutData!.condition,
        block: props.layoutData!.block,
      }
    : {
        collapsed,
        toggleCollapse,
        paddingLeft,
        fragmentStyle,
        border,
        leftParticipant,
        condition,
        block: blockInLoop,
      };

  return (
    <div className={props.className}>
      <div
        data-origin={props.origin}
        data-left-participant={data.leftParticipant}
        data-frame-padding-left={data.border.left}
        data-frame-padding-right={data.border.right}
        className="group fragment fragment-loop loop border-skin-fragment rounded"
        style={data.fragmentStyle}
      >
        {props.commentObj?.text && (
          <Comment comment={props.comment} commentObj={props.commentObj} />
        )}
        <div className="header text-skin-fragment-header bg-skin-fragment-header leading-4 relative rounded-t">
          <Numbering number={props.number} />
          <div className="name font-semibold p-1 border-b">
            <label className="p-0 flex items-center gap-0.5">
              <Icon name="loop-fragment" />
              <CollapseButton
                label="Loop"
                collapsed={data.collapsed}
                onClick={data.toggleCollapse}
                style={props.commentObj?.messageStyle}
                className={cn(props.commentObj?.messageClassNames)}
              />
            </label>
          </div>
        </div>
        <div className={cn({ hidden: data.collapsed })}>
          <div className="segment">
            <div className="text-skin-fragment">
              <ConditionLabel condition={data.condition} />
            </div>
            <Block
              origin={data.leftParticipant}
              style={{ paddingLeft: `${data.paddingLeft}px` }}
              context={data.block}
              number={`${props.number}.1`}
              incremental
            />
          </div>
        </div>
      </div>
    </div>
  );
};
