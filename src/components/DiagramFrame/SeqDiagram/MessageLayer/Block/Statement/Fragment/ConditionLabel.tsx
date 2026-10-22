import { specialCharRegex } from "@/utils/messageNormalizers";
import { EditableLabelField } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField";

const equalityRegex = /\b(\w+)\s*==\s*(\w+)\b/g;

// If text has special characters and is not an equality condition, wrap it
// with double quotes.
const normalizeCondition = (text: string) => {
  if (specialCharRegex.test(text) && !equalityRegex.test(text)) {
    // remove existing double quotes
    return `"${text.replace(/"/g, "")}"`;
  }
  return text;
};

export const ConditionLabel = (props: {
  condition?: any;
  keyword?: string;
}) => {
  return (
    <div className="guard-row flex items-baseline gap-1 p-1 min-h-7 leading-5 whitespace-nowrap text-skin-fragment font-normal">
      {props.keyword && (
        <span
          className={`guard-keyword text-xs leading-4 text-skin-guard font-normal [font-variant-caps:all-small-caps]${!props.condition ? " pt-[3px]" : ""}`}
        >
          {props.keyword}
        </span>
      )}
      {props.condition && (
        <EditableLabelField
          text={props.condition.getFormattedText() ?? ""}
          position={[props.condition.start?.start, props.condition.stop?.stop]}
          normalizeText={normalizeCondition}
          // Conditions are editable in Dynamic mode only; message labels
          // allow every mode except Static.
          editableIn="dynamic"
          className="bg-skin-frame opacity-skin-guard condition text-sm leading-5 font-normal !px-0"
          title="Click to edit condition"
        />
      )}
    </div>
  );
};
