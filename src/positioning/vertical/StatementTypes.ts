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
  | "return";

export type StatementAnchor = "message" | "occurrence" | "comment" | "return";
