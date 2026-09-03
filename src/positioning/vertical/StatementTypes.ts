/** Union of all supported statement types. */
export type StatementKind =
  | "loop"
  | "alt"
  | "par"
  | "opt"
  | "section"
  | "critical"
  | "tcf"
  | "ref"
  | "creation"
  | "sync"
  | "async"
  | "divider"
  | "return"
  | "empty";
