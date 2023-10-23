function buildCostDesc(diff: number): string {
  const seconds = Math.floor(diff / 1000);
  const milliseconds = Math.floor(diff % 1000);
  const microseconds = Math.floor(((diff % 1000) - milliseconds) * 1000);
  return seconds + "s " + milliseconds + "ms " + microseconds + "μs";
}

export const calculateCostTime = (
  processName: string,
  processStartTime: number,
) => {
  const now = getStartTime();
  const diff = now - processStartTime;
  console.debug(processName + " cost: " + buildCostDesc(diff));
  return diff;
};

export const getStartTime = () => {
  // Performance.now is more accurate than Date.now： https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
  return performance.now();
};
