import { AsyncMessageStatementVM } from "./AsyncMessageStatementVM";
import { CreationStatementVM } from "./CreationStatementVM";
import { DividerStatementVM } from "./DividerStatementVM";
import { EmptyStatementVM } from "./EmptyStatementVM";
import { FragmentAltVM } from "./FragmentAltVM";
import { FragmentRefVM } from "./FragmentRefVM";
import { FragmentSingleBlockVM } from "./FragmentSingleBlockVM";
import { FragmentTryCatchVM } from "./FragmentTryCatchVM";
import { ReturnStatementVM } from "./ReturnStatementVM";
import { SINGLE_BLOCK_FRAGMENT_KINDS } from "../StatementTypes";
import type { StatementVM } from "./StatementVM";
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

  for (const kind of SINGLE_BLOCK_FRAGMENT_KINDS) {
    const fragment = statement[kind]?.();
    if (fragment) {
      return new FragmentSingleBlockVM(statement, fragment, runtime, kind);
    }
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
