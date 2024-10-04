parser grammar activityParser;

options { tokenVocab=activityLexer; }

activityDiagram
    : START? (statement | STOP)* END?
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
    : ACTIVITY_CONTENT
    | (ARROW | REVERSE_ARROW | DOUBLE_ARROW) ACTIVITY_LABEL
    ;

ifStatement
    : IF condition
      (EQUALS condition)?
      THEN? branchLabel? (statement | STOP)*
      (branchLabel? ELSEIF condition (EQUALS condition)? THEN? branchLabel? (statement | STOP)*)*
      (branchLabel? ELSE branchLabel? (statement | STOP)*)?
      ENDIF
    ;

condition
    : LPAREN (ACTIVITY_LABEL | ACTIVITY_CONTENT) RPAREN
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
    : PARTITION ACTIVITY_LABEL? LBRACE
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
