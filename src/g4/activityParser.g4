parser grammar activityParser;

options { tokenVocab=activityLexer; }

activityDiagram
    : START? statement* (STOP | END)?
    ;

statement
    : activity
    | ifStatement
    | repeatStatement
    | whileStatement
    | forkStatement
    | splitStatement
    | noteStatement
    | partitionStatement
    | groupStatement
    | detachStatement
    | killStatement
    | gotoStatement
    | swimlane
    ;

activity
    : COLON ACTIVITY_LABEL SEMICOLON
    | COLON MULTILINE_STRING SEMICOLON
    | (ARROW | REVERSE_ARROW | DOUBLE_ARROW) ACTIVITY_LABEL
    ;

ifStatement
    : IF condition THEN? branchLabel? statement*
      (ELSEIF condition THEN? branchLabel? statement*)*
      (ELSE branchLabel? statement*)?
      ENDIF
    ;

condition
    : LPAREN ACTIVITY_LABEL RPAREN
    ;

branchLabel
    : LPAREN ACTIVITY_LABEL RPAREN
    ;

repeatStatement
    : REPEAT
      statement*
      (BACKWARD activity)?
      REPEAT_WHILE condition
    ;

whileStatement
    : WHILE condition
      statement*
      ENDWHILE (LPAREN ACTIVITY_LABEL RPAREN)?
    ;

forkStatement
    : FORK
      statement*
      (FORK_AGAIN statement*)*
      (END_FORK | END_MERGE) (LBRACE ACTIVITY_LABEL RBRACE)?
    ;

splitStatement
    : SPLIT
      statement*
      (SPLIT_AGAIN statement*)*
      END_SPLIT
    ;

noteStatement
    : NOTE (FLOATING)? (LEFT | RIGHT)? ACTIVITY_LABEL
      statement*
      END_NOTE?
    ;

partitionStatement
    : PARTITION STRING? LBRACE
      statement*
      RBRACE
    ;

groupStatement
    : (GROUP | PACKAGE | RECTANGLE | CARD) ACTIVITY_LABEL?
      statement*
      END
    ;

detachStatement
    : DETACH
    ;

killStatement
    : KILL
    ;

gotoStatement
    : GOTO IDENTIFIER
    ;

swimlane
    : PIPE (LBRACKET COLOR PIPE RBRACKET)? IDENTIFIER? PIPE ACTIVITY_LABEL?
    ;

stereotypeActivity
    : activity STEREOTYPE
    ;
