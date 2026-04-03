import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";
import { Fragment } from "react";
import { GapHandleZone } from "../GapHandleZone";

export const Block = (props: {
  origin?: string;
  context?: any;
  number?: string;
  incremental?: boolean;
  collapsed?: boolean;
  style?: React.CSSProperties;
  className?: string;
  enableGapHandles?: boolean;
}) => {
  const statements: any[] = props.context?.stat() || [];
  const enableGapHandles = props.enableGapHandles ?? false;
  const getNumber = (index: number) => {
    if (props.number) {
      return props.incremental
        ? increaseNumber(props.number, index)
        : `${props.number}.${index + 1}`;
    }
    return String(index + 1);
  };
  return (
    <div
      className={cn("block", props.className)}
      style={props.style}
      data-origin={props.origin}
    >
      {enableGapHandles && statements.length === 0 && (
        <GapHandleZone
          insertIndex={0}
          blockContext={props.context}
          origin={props.origin || ""}
          isEmpty
        />
      )}
      {statements.map((stat, index) => (
        <Fragment key={index}>
          {enableGapHandles && (
            <GapHandleZone
              insertIndex={index}
              blockContext={props.context}
              origin={props.origin || ""}
            />
          )}
          <div
            className={cn("statement-container my-4 flex flex-col")}
            data-origin={props.origin}
            data-statement-key={createStatementKey(stat)}
          >
            <Statement
              origin={props.origin || ""}
              context={stat}
              collapsed={Boolean(props.collapsed)}
              number={getNumber(index)}
            />
          </div>
        </Fragment>
      ))}
      {enableGapHandles && statements.length > 0 && (
        <GapHandleZone
          insertIndex={statements.length}
          blockContext={props.context}
          origin={props.origin || ""}
        />
      )}
    </div>
  );
};
