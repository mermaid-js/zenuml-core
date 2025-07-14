import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import "./FragmentCritical.css";
import Icon from "@/components/Icon/Icons";

export const FragmentCritical = (props: {
  context?: any;
  origin?: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  layoutData?: {
    fragmentId: string;
    condition?: string;
    collapsed: boolean;
    paddingLeft: number;
    fragmentStyle: React.CSSProperties;
    border: { left: number; right: number };
    leftParticipant: string;
    blockContext?: any;
    style?: React.CSSProperties;
  };
}) => {
  // Determine which architecture to use
  const isNewArchitecture = !!props.layoutData;
  
  // Always call hooks at top level to maintain hook order
  const fragmentData = useFragmentData(props.context, props.origin);

  // Extract unified data
  const collapsed = isNewArchitecture ? props.layoutData!.collapsed : fragmentData.collapsed;
  const toggleCollapse = isNewArchitecture ? () => {} : fragmentData.toggleCollapse; // TODO: Implement collapse for new architecture
  const paddingLeft = isNewArchitecture ? props.layoutData!.paddingLeft : fragmentData.paddingLeft;
  const fragmentStyle = isNewArchitecture ? props.layoutData!.fragmentStyle : fragmentData.fragmentStyle;
  const border = isNewArchitecture ? props.layoutData!.border : fragmentData.border;
  const leftParticipant = isNewArchitecture ? props.layoutData!.leftParticipant : fragmentData.leftParticipant;

  const critical = props.context?.critical();
  const braceBlock = critical?.braceBlock();
  const atom = critical?.atom()?.getFormattedText();
  const blockInCritical = isNewArchitecture ? props.layoutData!.blockContext : braceBlock?.block();

  const condition = isNewArchitecture ? props.layoutData!.condition : atom;
  const label = condition ? `Critical:${condition}` : "Critical";

  return (
    <div className={props.className}>
      <div
        data-origin={props.origin}
        data-left-participant={leftParticipant}
        data-frame-padding-left={border.left}
        data-frame-padding-right={border.right}
        className="group fragment fragment-critical critical border-skin-fragment rounded"
        style={{
          ...fragmentStyle,
          ...(isNewArchitecture ? props.layoutData!.style : {}),
        }}
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
                context={blockInCritical}
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
