let lastRenderingCostMilliseconds = 0;
function buildCostDesc(diff: number): string {
  const seconds = Math.floor(diff / 1000);
  const milliseconds = Math.floor(diff % 1000);
  const microseconds = Math.floor(((diff % 1000) - milliseconds) * 1000);
  return seconds + "s " + milliseconds + "ms " + microseconds + "μs";
}

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export const calculateDebounceMilliseconds = (): number => {
  let delay = lastRenderingCostMilliseconds;
  if (delay > 2000) delay = 2000;
  if (isDev()) {
    console.log("render will delay: " + delay + "ms");
  }
  return delay;
};

export const printCostTime = (processName: string, processStartTime: any) => {
  const now = getStartTime();
  const diff = now - processStartTime;
  lastRenderingCostMilliseconds = diff;
  if (isDev()) {
    console.log(processName + " cost: " + buildCostDesc(diff));
  }
  //In multiple consecutive processes, the next process can be used as processStartTime, and there is no need to call getNow() again.
  return now;
};

export const getStartTime = () => {
  // Performance.now is more accurate than Date.now： https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
  return performance.now();
};
