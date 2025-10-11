import { AsyncMessageStatementVM } from "./AsyncMessageStatementVM";
import { CreationStatementVM } from "./CreationStatementVM";
import { DividerStatementVM } from "./DividerStatementVM";
import { EmptyStatementVM } from "./EmptyStatementVM";
import { FragmentAltVM } from "./FragmentAltVM";
import { FragmentCriticalVM } from "./FragmentCriticalVM";
import { FragmentLoopVM } from "./FragmentLoopVM";
import { FragmentOptVM } from "./FragmentOptVM";
import { FragmentParVM } from "./FragmentParVM";
import { FragmentRefVM } from "./FragmentRefVM";
import { FragmentSectionVM } from "./FragmentSectionVM";
import { FragmentTryCatchVM } from "./FragmentTryCatchVM";
import { ReturnStatementVM } from "./ReturnStatementVM";
import { StatementVM } from "./StatementVM";
import { SyncMessageStatementVM } from "./SyncMessageStatementVM";

export const createStatementVM = (statement: any): StatementVM => {
  const creation = statement.creation?.();
  if (creation) {
    return new CreationStatementVM(statement, creation);
  }

  const message = statement.message?.();
  if (message) {
    return new SyncMessageStatementVM(statement, message);
  }

  const asyncMessage = statement.asyncMessage?.();
  if (asyncMessage) {
    return new AsyncMessageStatementVM(statement, asyncMessage);
  }

  if (statement.ret?.()) {
    return new ReturnStatementVM(statement);
  }

  if (statement.divider?.()) {
    return new DividerStatementVM(statement);
  }

  const loop = statement.loop?.();
  if (loop) {
    return new FragmentLoopVM(statement, loop);
  }

  const opt = statement.opt?.();
  if (opt) {
    return new FragmentOptVM(statement, opt);
  }

  const par = statement.par?.();
  if (par) {
    return new FragmentParVM(statement, par);
  }

  const section = statement.section?.();
  if (section) {
    return new FragmentSectionVM(statement, section);
  }

  const critical = statement.critical?.();
  if (critical) {
    return new FragmentCriticalVM(statement, critical);
  }

  const tcf = statement.tcf?.();
  if (tcf) {
    return new FragmentTryCatchVM(statement, tcf);
  }

  const alt = statement.alt?.();
  if (alt) {
    return new FragmentAltVM(statement, alt);
  }

  if (statement.ref?.()) {
    return new FragmentRefVM(statement);
  }

  return new EmptyStatementVM(statement);
};
