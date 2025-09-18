import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import type { BlockVM } from "@/vm/block";

export const Block = (props: {
  origin?: string;
  number?: string;
  incremental?: boolean;
  collapsed?: boolean;
  style?: React.CSSProperties;
  className?: string;
  vm: BlockVM;
}) => {
  const statements: any[] = props.vm?.statements || [];
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
      {statements.map((stat, index) => (
        <div
          className={cn(
            "statement-container my-4",
            index === statements.length - 1 &&
              "[&>.return]:-mb-4 [&>.return]:bottom-[-1px]",
          )}
          data-origin={props.origin}
          key={index}
        >
          <Statement
            origin={props.origin || ""}
            context={stat}
            collapsed={Boolean(props.collapsed)}
            number={getNumber(index)}
          />
        </div>
      ))}
    </div>
  );
};
