export const ArrowHead = (props: {
  x: number;
  y: number;
  fill: boolean;
  rtl: boolean;
  className?: string;
}) => {
  const { x, y, fill, rtl, className } = props;

  // Filled arrow (wider solid triangle)
  if (fill) {
    return (
      <svg
        className={className}
        x={x}
        y={y}
        height="10"
        width="10"
        viewBox="0 0 5 6"
      >
        <g transform={rtl ? "scale(-1, 1) translate(-5, 0)" : undefined}>
          <path
            d="M5.42834 2.657C5.68727 2.81236 5.68727 3.18764 5.42834 3.343L1.605799 5.63652C1.339189 5.79649 1 5.60444 1 5.29352L1 0.706476C1 0.395559 1.339189 0.203513 1.605799 0.363479L5.42834 2.657Z"
            fill="currentColor"
            stroke="none"
          />
        </g>
      </svg>
    );
  }

  // Open arrow (narrower line triangle)
  return (
    <svg
      className={className}
      x={x}
      y={y}
      height="10"
      width="5"
      viewBox="0 0 5 9"
    >
      <g transform={rtl ? "scale(-1, 1) translate(-5, 0)" : undefined}>
        <path
          d="M1 1.25L4.14331 4.54299C4.14704 4.5469 4.14699 4.55306 4.1432 4.55691L1 7.75"
          stroke="currentColor"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
};