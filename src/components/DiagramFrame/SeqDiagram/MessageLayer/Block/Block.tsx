import { increaseNumber } from "@/utils/Numbering";
import { Statement } from "./Statement/Statement";
import { cn } from "@/utils";
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";

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
      className={cn("block", props.className)}
      style={props.style}
      data-origin={props.origin}
    >
      {statements.map((stat, index) => (
        <div
          className={cn("statement-container my-4 flex flex-col")}
          data-origin={props.origin}
          data-statement-key={createStatementKey(stat)}
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
