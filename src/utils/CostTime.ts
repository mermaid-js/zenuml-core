export const calculateCostTime = (processStartTime: number) => {
  const now = getStartTime();
  const diff = now - processStartTime;
  return diff;
};

export const getStartTime = () => {
  // Performance.now is more accurate than Date.now： https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
  return performance.now();
};
