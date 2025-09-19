import CommentClass from "@/components/Comment/Comment";
import { useFragmentData } from "./useFragmentData";
import { Comment } from "../Comment/Comment";
import { Numbering } from "../../../Numbering";
import { CollapseButton } from "./CollapseButton";
import { Block } from "../../Block";
import { capitalize } from "radash";
import { cn } from "@/utils";
import "./FragmentSection.css";
import Icon from "@/components/Icon/Icons";
import type { FragmentData, SectionVM } from "@/vm/fragments";

export const FragmentSection = (props: {
  fragmentData: FragmentData;
  vm?: SectionVM | null; // VM provides label and block
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
  const sectionVM = props.vm;
  const label = sectionVM?.labelText ?? capitalize("section");

  return (
    <div className={props.className}>
      <div
        data-origin={origin}
        data-left-participant={leftParticipant}
        data-frame-padding-left={border.left}
        data-frame-padding-right={border.right}
        className="group fragment fragment-section section border-skin-fragment rounded"
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
                <Icon name="section-fragment" />
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
            <div className="text-skin-fragment flex"></div>
            {sectionVM?.blockVM && (
              <Block
                origin={leftParticipant}
                style={{ paddingLeft: `${paddingLeft}px` }}
                vm={sectionVM.blockVM}
                number={props.number}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
