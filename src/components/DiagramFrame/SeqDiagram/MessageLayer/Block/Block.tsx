import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import { buildBlockVM, type BlockVM } from "@/vm/block";
import { useMemo } from "react";

export const Block = (props: {
  origin?: string;
  context?: any;
  number?: string;
  incremental?: boolean;
  collapsed?: boolean;
  style?: React.CSSProperties;
  className?: string;
  vm?: BlockVM;
}) => {
  // Prefer VM if provided; otherwise build from context.
  const vm = useMemo(() => props.vm ?? buildBlockVM(props.context), [props.vm, props.context]);
  const statements: any[] = vm.statements || [];
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
