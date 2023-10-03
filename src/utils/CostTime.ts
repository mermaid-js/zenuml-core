let totalDiff=0;
function buildCostDesc(diff: number): string {
  const seconds = Math.floor(diff / 1000);
  const milliseconds = Math.floor((diff % 1000));
  const microseconds = Math.floor(((diff % 1000) - milliseconds) * 1000);
  return seconds + "s " + milliseconds + "ms " + microseconds + "μs";
}

function isDev():boolean{
  return process.env.NODE_ENV==='development';
}

export const printTotalCostTime = (resetDiff:boolean|undefined) => {
    if(!isDev())return;
    console.log("CostTime total cost: "+buildCostDesc(totalDiff));
    if(resetDiff===true)totalDiff=0;
};

export const printCostTime = (processName:string,processStartTime:any) => {
    if(!isDev())return;
    let now=getStartTime();
    let diff = now - processStartTime;
    console.log(processName+" cost: "+buildCostDesc(diff));
    totalDiff+=diff;
    //In multiple consecutive processes, the next process can be used as processStartTime, and there is no need to call getNow() again.
    return now;
  };

export const getStartTime = () => {
  if(!isDev())return 0;
  // Performance.now is more accurate than Date.now： https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
  //return new Date().getTime();
  return performance.now();
};





