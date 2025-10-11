import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import type { BlockVM } from "@/vm/types";

export const Block = (props: {
  number?: string;
  incremental?: boolean;
  collapsed?: boolean;
  style?: React.CSSProperties;
  className?: string;
  vm: BlockVM;
}) => {

  const statementVMs = props.vm?.statements || [];
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
    >
      {statementVMs.map((vm, index) => (
        <div
          className={cn(
            "statement-container my-4",
            index === statementVMs.length - 1 &&
              "[&>.return]:-mb-4 [&>.return]:bottom-[-1px]",
          )}
          key={index}
        >
          <Statement
            vm={vm}
            collapsed={Boolean(props.collapsed)}
            number={getNumber(index)}
          />
        </div>
      ))}
    </div>
  );
};
