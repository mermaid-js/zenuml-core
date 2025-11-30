export const createStatementKey = (statement: any): string => {
  if (!statement?.start || !statement?.stop) {
    return "";
  }
  return `${statement.start.start}-${statement.stop.stop}`;
};
