import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { cn } from "@/utils";
import { Block } from "../../Block";
import "./FragmentPar.css";
import Icon from "@/components/Icon/Icons";

export const FragmentPar = (props: {
  context?: any;
  origin?: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  layoutData?: {
    fragmentId: string;
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

  const par = props.context?.par();
  const blockContext = isNewArchitecture ? props.layoutData!.blockContext : par?.braceBlock()?.block();

  return (
    <div className={props.className}>
      <div
        data-origin={props.origin}
        data-left-participant={leftParticipant}
        data-frame-padding-left={border.left}
        data-frame-padding-right={border.right}
        className="group fragment fragment-par par border-skin-fragment rounded"
        style={{
          ...fragmentStyle,
          ...(isNewArchitecture ? props.layoutData!.style : {}),
        }}
      >
        {props.commentObj?.text && (
          <Comment comment={props.comment} commentObj={props.commentObj} />
        )}
        <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative">
          <Numbering number={props.number} />
          <div className="name font-semibold p-1 border-b">
            <label className="p-0 flex items-center gap-0.5">
              <Icon name="par-fragment" />
              <CollapseButton
                label="Par"
                collapsed={collapsed}
                onClick={toggleCollapse} // Assuming 'this.toggle' is accessible or replace with appropriate handler
                style={props.commentObj?.messageStyle}
                className={cn(props.commentObj?.messageClassNames)}
              />
            </label>
          </div>
        </div>
        {(isNewArchitecture ? blockContext : !!par?.braceBlock()) && (
          <Block
            origin={leftParticipant}
            className={cn(
              "[&>.statement-container:not(:first-child)]",
              collapsed ? "hidden" : "",
            )}
            style={{ paddingLeft: `${paddingLeft}px` }}
            context={blockContext}
            number={`${props.number}.1`}
            incremental
          />
        )}
      </div>
    </div>
  );
};
