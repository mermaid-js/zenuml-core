import { SequenceASTNode } from "./astNode.types";

export interface IParser {
  parse(code: string): ParserResult;
  getErrors(): ParserError[];
}

export interface ParserResult {
  ast: SequenceASTNode;
  errors: ParserError[];
  success: boolean;
}

export interface ParserError {
  message: string;
  line: number;
  column: number;
  range: [number, number];
}
