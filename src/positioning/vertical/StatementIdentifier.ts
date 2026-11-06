export const createStatementKey = (statement: any): string => {
  if (!statement?.start || !statement?.stop) {
    return "";
  }
  return `${statement.start.start}-${statement.stop.stop}`;
};

/** Inverse of `createStatementKey`: `"12-34"` becomes `[12, 34]`. */
export const parseStatementKey = (key: string): [number, number] => {
  const [start, stop] = key.split("-").map(Number);
  return [start, stop];
};
