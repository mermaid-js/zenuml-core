import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import { Fragment } from "react/jsx-runtime";
import { Anchor } from "../Anchor";

export const Block = (props: {
  origin?: string;
  context?: any;
  number?: string;
  incremental?: boolean;
  collapsed?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const statements: any[] = props.context?.stat() || [];
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
      className={cn("block pointer-events-none", props.className)}
      style={props.style}
      data-origin={props.origin}
    >
      <Anchor
        context={props.context}
        index={0}
        participant={props.origin || ""}
      />
      {statements.map((stat, index) => (
        <Fragment key={index}>
          <div
            className={cn(
              "statement-container pointer-events-none",
              index === statements.length - 1 &&
                "[&>.return]:-mb-4 [&>.return]:bottom-[-1px]",
            )}
            data-origin={props.origin}
          >
            <Statement
              origin={props.origin || ""}
              context={stat}
              collapsed={Boolean(props.collapsed)}
              number={getNumber(index)}
            />
          </div>
          <Anchor
            context={props.context}
            index={index + 1}
            participant={props.origin || ""}
          />
        </Fragment>
      ))}
    </div>
  );
};
