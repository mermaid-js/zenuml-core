grammar Pie
import "./common";

entry Pie:
  NEWLINE*
  "pie" showData?="showData"?
  (
    TitleAndAccessibilities
    | sections+=PieSection
    | NEWLINE
  )*
;

PieSection:
  label=STRING ":" value=NUMBER EOL
;
