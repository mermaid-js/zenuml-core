import Icon from "@/components/Icon/Icons";
import { cn } from "@/utils";
import { useCapClick } from "@/store/interaction/useCan";

export const CollapseButton = (props: {
  collapsed?: boolean;
  onClick?: () => void;
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
      className="occurrence-collapsible-header absolute top-px -left-[5px] w-auto"
      {...pressProps}
    >
      {/* Hidden until the occurrence (a `group`) is hovered, and only while
          `collapse` is allowed (P4), like the fragment's button. Not
          `hoverAffordance`: collapse is view-only and stays live in a static
          render. */}
      <div
        className={cn(
          "hidden",
          canCollapse &&
            !props.collapsed &&
            "group-[.occurrence]:group-hover:block",
        )}
      >
        <Icon
          name="occurrence-collapse"
          className={cn("w-5 h-5 collapse-button", {
            "cursor-pointer": canCollapse,
            hidden: props.collapsed,
            expanded: !props.collapsed,
            "hover-reveal": canCollapse,
          })}
          onClick={onClick}
        />
      </div>
      <Icon
        name="occurrence-expand"
        className={cn("w-5 h-5", {
          "cursor-pointer": canCollapse,
          hidden: !props.collapsed,
        })}
        onClick={onClick}
      />
    </div>
  );
};
