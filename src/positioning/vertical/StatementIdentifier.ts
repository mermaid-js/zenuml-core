export type StatementKey = string;

export const createStatementKey = (ctx: any): StatementKey => {
  if (!ctx?.start || !ctx?.stop) {
    return "";
  }
  return `${ctx.start.start}-${ctx.stop.stop}`;
};
