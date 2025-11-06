export const ArrowHead = (props: {
  fill: boolean;
  rtl: boolean;
}) => {
  const { fill, rtl } = props;

  // Single unified arrow shape for both filled and open
  return (
    <svg
      className="stroke-2"
      height="10"
      width="7"
      viewBox="0 0 7 9"
    >
      <g transform={rtl ? "scale(-1, 1) translate(-7, 0)" : undefined}>
        <path
          d={fill ? "M1 1.25 L6.15 4.5 L1 7.75 Z" : "M1 1.25 L6.15 4.5 L1 7.75"}
          stroke="currentColor"
          strokeLinecap="round"
          fill={fill ? "currentColor" : "none"}
        />
      </g>
    </svg>
  );
};