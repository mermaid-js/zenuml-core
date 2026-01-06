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

/** Named anchor points that consumers can use to align canvas layers. */
export type StatementAnchor = "message" | "occurrence" | "comment" | "return";
