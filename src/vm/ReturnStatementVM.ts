import { MESSAGE_HEIGHT } from "@/positioning/Constants";
import { StatementVM } from "./StatementVM";

export class ReturnStatementVM extends StatementVM {
  protected heightAfterComment(_origin: string): number {
    return MESSAGE_HEIGHT;
  }
}
