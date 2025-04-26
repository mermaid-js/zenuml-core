import { cn } from "@/utils";

export const CollapseButton = (props: {
  collapsed?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div className="collapsible-header flex w-full justify-between">
      <svg
        width="20px"
        height="20px"
        className={cn("collapse-button cursor-pointer", {
          hidden: props.collapsed,
          expanded: !props.collapsed,
        })}
        onClick={props.onClick}
        viewBox="0 0 25 25"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="miter"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <line x1="13" y1="2" x2="13" y2="10"></line>
          <polyline points="9 7 13 11 17 7"></polyline>
          <line x1="13" y1="23" x2="13" y2="15"></line>
          <polyline points="9 19 13 15 17 19"></polyline>
        </g>
      </svg>
      <svg
        width="20px"
        height="20px"
        className={cn("cursor-pointer", { hidden: !props.collapsed })}
        onClick={props.onClick}
        viewBox="0 0 25 25"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="miter"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <line x1="13" y1="1" x2="13" y2="9"></line>
          <polyline points="9 5 13 1 17 5"></polyline>
          <line x1="13" y1="13" x2="13" y2="13"></line>
          <line x1="13" y1="24" x2="13" y2="17"></line>
          <polyline points="9 20 13 24 17 20"></polyline>
        </g>
      </svg>
    </div>
  );
};
