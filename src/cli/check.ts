/** Check mode: validate syntax without rendering. */
import Parser from "@/parser/index";
import { readCode } from "./inputs";

export interface FileCheckResult {
  file: string;
  pass: boolean;
  errors: Array<{ line: number; column: number; msg: string }>;
}

/** Parse one file/input and return check result. Clears Parser.ErrorDetails before each parse. */
export async function checkOne(input: string): Promise<FileCheckResult> {
  const fileName = input === "-" ? "<stdin>" : input;
  let code: string;
  try {
    code = await readCode(input);
  } catch (err: any) {
    return {
      file: fileName,
      pass: false,
      errors: [{ line: 0, column: 0, msg: err.message }],
    };
  }

  // Clear accumulated errors before parsing
  Parser.ErrorDetails.length = 0;

  Parser.RootContext(code);

  const errors = Parser.ErrorDetails.map((e: any) => ({
    line: e.line,
    column: e.column,
    msg: e.msg,
  }));

  return {
    file: fileName,
    pass: errors.length === 0,
    errors,
  };
}
