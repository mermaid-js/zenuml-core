import { EditableLabelField } from "./EditableLabelField";
import { cn } from "@/utils";

export const MessageLabel = (props: {
  labelText: string;
  labelPosition: [number, number];
  normalizeText?: (text: string) => string;
  className?: string;
}) => {
  return (
    <EditableLabelField
      text={props.labelText}
      position={props.labelPosition}
      normalizeText={props.normalizeText}
      className={cn("px-1 right", props.className)}
    />
  );
};
