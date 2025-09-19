import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import "./FragmentCritical.css";
import Icon from "@/components/Icon/Icons";
import { formattedTextOf } from "@/parser/helpers";
import { buildBlockVM } from "@/vm/block";
import { FragmentData } from "@/vm/fragments";

export const FragmentCritical = (props: {
  fragmentData: FragmentData;
  context: any; // Still needed for building content VMs until we extract more data
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}) => {
  const {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    border,
    leftParticipant,
  } = useFragmentData(props.fragmentData, props.origin);

  const critical = props.context.critical();
  const braceBlock = critical?.braceBlock();
  const atom = formattedTextOf(critical?.atom?.());
  const blockInCritical = braceBlock?.block();

  const label = atom ? `Critical:${atom}` : "Critical";

  return (
    <div className={props.className}>
      <div
        data-origin={origin}
        data-left-participant={leftParticipant}
        data-frame-padding-left={border.left}
        data-frame-padding-right={border.right}
        className="group fragment fragment-critical critical border-skin-fragment rounded"
        style={fragmentStyle}
      >
        <div className="segment">
          {props.commentObj?.text && (
            <Comment comment={props.comment} commentObj={props.commentObj} />
          )}
          <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative">
            <Numbering number={props.number} />
            <div className="name font-semibold p-1 border-b">
              <label className="p-0 flex items-center gap-0.5">
                <Icon name="critical-fragment" />
                <CollapseButton
                  label={label}
                  collapsed={collapsed}
                  onClick={toggleCollapse}
                  style={props.commentObj?.messageStyle}
                  className={cn(props.commentObj?.messageClassNames)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className={collapsed ? "hidden" : ""}>
          <div className="segment">
            <div className="text-skin-fragment flex">{/* Value */}</div>
            {blockInCritical && (
              <Block
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={buildBlockVM(blockInCritical)}
                number={`${props.number}.1`}
                incremental
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
