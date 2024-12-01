import { IStatement } from "./types";

export class StatementList {
  private statements: (IStatement | null)[] = [];

  add(statement: IStatement) {
    this.statements.push(statement);
  }

  empty() {
    this.statements = [null];
  }
}
