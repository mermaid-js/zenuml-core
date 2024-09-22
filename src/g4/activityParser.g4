parser grammar activityParser;

options {
  tokenVocab = activityLexer;
}

program
  : stat+ EOF
  ;

stat
  : simple
  | loopBlock
  | ifBlock
//  | alt
  ;

simple
  : COL .*? SCOL
  ;

alt
  : ifBlock
  ;

ifBlock
  : IF OPAR LABEL CPAR
  ;

loopBlock
  : LOOP
  ;
