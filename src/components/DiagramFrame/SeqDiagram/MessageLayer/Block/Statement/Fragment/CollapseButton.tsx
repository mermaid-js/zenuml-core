import Icon from "@/components/Icon/Icons";
import { cn } from "@/utils";
import "./CollapseButton.css";

export const CollapseButton = (props: {
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "collapsible-header flex w-full justify-between",
        props.className,
      )}
      style={props.style}
    >
      <label className="mb-0">{props.label}</label>
      {props.collapsed ? (
        <Icon
          name="collapse-unexpanded"
          className="w-4 h-4 cursor-pointer"
          onClick={props.onClick}
        />
      ) : (
        <Icon
          name="collapse-expanded"
          className={cn(
            "w-4 h-4 collapse-button cursor-pointer hidden group-[.fragment]:group-hover:inline-block",
            props.collapsed && "inline-block",
          )}
          onClick={props.onClick}
        />
      )}
    </div>
  );
};
