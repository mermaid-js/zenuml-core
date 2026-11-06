import { AsyncMessageStatementVM } from "./AsyncMessageStatementVM";
import { CreationStatementVM } from "./CreationStatementVM";
import { DividerStatementVM } from "./DividerStatementVM";
import { EmptyStatementVM } from "./EmptyStatementVM";
import { FragmentAltVM } from "./FragmentAltVM";
import { FragmentRefVM } from "./FragmentRefVM";
import { FragmentSingleBlockVM } from "./FragmentSingleBlockVM";
import { FragmentTryCatchVM } from "./FragmentTryCatchVM";
import { ReturnStatementVM } from "./ReturnStatementVM";
import { fragmentOf } from "@/parser/fragmentOf";
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

  const fragment = fragmentOf(statement);
  if (fragment) {
    switch (fragment.kind) {
      case "tcf":
        return new FragmentTryCatchVM(statement, fragment.context, runtime);
      case "alt":
        return new FragmentAltVM(statement, fragment.context, runtime);
      case "ref":
        return new FragmentRefVM(statement, runtime);
      default:
        return new FragmentSingleBlockVM(
          statement,
          fragment.context,
          runtime,
          fragment.kind,
        );
    }
  }

  return new EmptyStatementVM(statement, runtime);
};
