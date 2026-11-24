/** Rows for the compact syntax cheat-sheet panel. */
export interface CheatRow {
  what: string;
  syntax: string;
}

export const CHEAT_SHEET: readonly CheatRow[] = [
  { what: "A calls B", syntax: "A.method()" },
  { what: "A sends B a note", syntax: "A->B: hello" },
  { what: "Reply with a result", syntax: "A.method() {\n  return result\n}" },
  { what: "Only if something is true", syntax: "if (ok) {\n  A.method()\n}" },
  { what: "Two paths", syntax: "if (ok) {\n  A.yes()\n} else {\n  A.no()\n}" },
  { what: "Repeat", syntax: "loop (more) {\n  A.method()\n}" },
  { what: "Optional step", syntax: "opt {\n  A.method()\n}" },
  { what: "At the same time", syntax: "par {\n  A.one()\n  B.two()\n}" },
  {
    what: "Handle a failure",
    syntax: "try {\n  A.method()\n} catch {\n  B.fix()\n}",
  },
];
