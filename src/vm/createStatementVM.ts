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
import type { LayoutRuntime } from "./types";
import { SyncMessageStatementVM } from "./SyncMessageStatementVM";

export const createStatementVM = (
  statement: any,
  runtime: LayoutRuntime,
): StatementVM => {
  const creation = statement.creation?.();
  if (creation) {
    return new CreationStatementVM(statement, creation, runtime);
  }

  const message = statement.message?.();
  if (message) {
    return new SyncMessageStatementVM(statement, message, runtime);
  }

  const asyncMessage = statement.asyncMessage?.();
  if (asyncMessage) {
    return new AsyncMessageStatementVM(statement, asyncMessage, runtime);
  }

  if (statement.ret?.()) {
    return new ReturnStatementVM(statement, runtime);
  }

  if (statement.divider?.()) {
    return new DividerStatementVM(statement, runtime);
  }

  const loop = statement.loop?.();
  if (loop) {
    return new FragmentLoopVM(statement, loop, runtime);
  }

  const opt = statement.opt?.();
  if (opt) {
    return new FragmentOptVM(statement, opt, runtime);
  }

  const par = statement.par?.();
  if (par) {
    return new FragmentParVM(statement, par, runtime);
  }

  const section = statement.section?.();
  if (section) {
    return new FragmentSectionVM(statement, section, runtime);
  }

  const critical = statement.critical?.();
  if (critical) {
    return new FragmentCriticalVM(statement, critical, runtime);
  }

  const tcf = statement.tcf?.();
  if (tcf) {
    return new FragmentTryCatchVM(statement, tcf, runtime);
  }

  const alt = statement.alt?.();
  if (alt) {
    return new FragmentAltVM(statement, alt, runtime);
  }

  if (statement.ref?.()) {
    return new FragmentRefVM(statement, runtime);
  }

  return new EmptyStatementVM(statement, runtime);
};
