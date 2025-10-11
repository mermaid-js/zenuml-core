import { StatementVM } from "./StatementVM";

export class EmptyStatementVM extends StatementVM {
  protected heightAfterComment(_origin: string): number {
    return 0;
  }
}
