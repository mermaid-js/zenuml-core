import Icon from "@/components/Icon/Icons";
import { cn } from "@/utils";
import { useCapClick } from "@/store/interaction/useCan";
import "./CollapseButton.css";

export const CollapseButton = (props: {
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}) => {
  // While another interaction owns the diagram, the icon still shows the
  // collapsed state but does nothing (ADR 0002).
  const {
    allowed: canCollapse,
    pressProps,
    onClick,
  } = useCapClick("collapse", props.onClick);
  return (
    <div
      className={cn(
        "collapsible-header flex w-full justify-between",
        props.className,
      )}
      style={props.style}
      {...pressProps}
    >
      {/* Small caps only fill the lower part of the 16px line box, so their ink
          sits ~1.5px below the icon and number centres; nudge them back up. */}
      <label className="mb-0 -translate-y-[1.5px] [font-variant-caps:all-small-caps]">
        {props.label}
      </label>
      {props.collapsed ? (
        <Icon
          name="collapse-unexpanded"
          className={cn("w-4 h-4", canCollapse && "cursor-pointer")}
          onClick={onClick}
        />
      ) : (
        <Icon
          name="collapse-expanded"
          className={cn(
            "w-4 h-4 collapse-button cursor-pointer hidden",
            canCollapse && "group-[.fragment]:group-hover:inline-block",
            props.collapsed && "inline-block",
          )}
          onClick={onClick}
        />
      )}
    </div>
  );
};
