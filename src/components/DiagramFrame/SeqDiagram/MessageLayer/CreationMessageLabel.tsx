import { modeAtom } from "@/store/Store";
import { cn } from "@/utils";
import { useAtomValue } from "jotai";
import { RenderMode } from "@/store/Store";
import { EditableLabelField } from "./EditableLabelField";

export interface CreationMessageLabelProps {
  labelText: string;
  labelPosition: [number, number];
  normalizeText?: (text: string) => string;
  className?: string;
}

export const CreationMessageLabel = ({
  labelText,
  labelPosition,
  normalizeText,
  className,
}: CreationMessageLabelProps) => {
  const mode = useAtomValue(modeAtom);
  const isEditable = mode !== RenderMode.Static;

  // In static/readonly mode, render plain text with default "create" if empty
  if (!isEditable) {
    return <>{`«${labelText || "create"}»`}</>;
  }

  if (!labelText) {
    return <>{`«create»`}</>;
  }

  // In editable mode, render with EditableLabelField
  return (
    <>
      <span>«</span>
      <EditableLabelField
        text={labelText}
        position={labelPosition}
        normalizeText={normalizeText}
        className={cn("right", className)}
      />
      <span>»</span>
    </>
  );
};
