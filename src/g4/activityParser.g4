parser grammar activityParser;

options { tokenVocab=activityLexer; }

activityDiagram
    : STARTUML?
      (statement)*
      ENDUML?
    ;

statement
    : activity
    | START
    | STOP
    | END
    | ifStatement
    | switchStatement
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
    | ARROW
    | connectStatement
    ;

activity
    : COLOR_ANNOTATION? ACTIVITY_CONTENT
    ;

connectStatement
    : CONNECT
    ;

ifStatement
    : IF condition
      (EQUALS condition)?
      THEN? branchLabel? (statement | ARROW)*
      (branchLabel? ELSEIF condition (EQUALS condition)? THEN? branchLabel? (statement | ARROW)*)*
      (branchLabel? ELSE branchLabel? (statement | ARROW)*)?
      ENDIF
    ;

switchStatement
    : SWITCH condition
      (caseStatement)*
      ENDSWITCH
    ;

caseStatement
    : CASE condition (statement | ARROW)*
    ;

repeatStatement
    : REPEAT
      (statement | ARROW)*
      (BACKWARD activity)?
      REPEAT_WHILE condition
      (IS branchLabel NOT branchLabel)?
    ;

whileStatement
    : WHILE condition
      (statement | ARROW)*
      ENDWHILE (LPAREN ACTIVITY_LABEL RPAREN)?
    ;

forkStatement
    : FORK
      (statement | ARROW)*
      (FORK_AGAIN (statement | ARROW)*)*
      (END_FORK | END_MERGE) (LBRACE ACTIVITY_LABEL RBRACE)?
    ;

splitStatement
    : SPLIT
      (statement | ARROW)*
      (SPLIT_AGAIN (statement | ARROW)*)*
      END_SPLIT
    ;

noteStatement
    : NOTE (FLOATING)? (LEFT | RIGHT)? ACTIVITY_LABEL
      (statement | ARROW)*
      END_NOTE?
    ;

partitionStatement
    : PARTITION ACTIVITY_LABEL? LBRACE
      (statement | ARROW)*
      RBRACE
    ;

groupStatement
    : GROUP
      statement*
      END_GROUP
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
    : PIPE (LBRACKET COLOR_ANNOTATION PIPE RBRACKET)? IDENTIFIER? PIPE ACTIVITY_LABEL?
    ;

condition
    : LPAREN (ACTIVITY_LABEL | ACTIVITY_CONTENT) RPAREN
    ;

branchLabel
    : LPAREN ACTIVITY_LABEL RPAREN
    ;

stereotypeActivity
    : activity STEREOTYPE
    ;
