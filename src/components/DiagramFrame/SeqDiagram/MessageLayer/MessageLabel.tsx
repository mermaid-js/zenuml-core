import {
  EditableLabelField,
  useReselectSavedMessage,
} from "./EditableLabelField";
import { cn } from "@/utils";

export const MessageLabel = (props: {
  labelText: string;
  labelPosition: [number, number];
  normalizeText?: (text: string) => string;
  className?: string;
}) => {
  const reselect = useReselectSavedMessage();
  return (
    <EditableLabelField
      text={props.labelText}
      position={props.labelPosition}
      normalizeText={props.normalizeText}
      afterSave={reselect}
      className={cn("px-1 right", props.className)}
    />
  );
};
