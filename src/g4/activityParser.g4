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
    | labelStatement
    | gotoStatement
    | swimlane     // The first swimlane statement must be the first statement. TODO: add validation.
    | ARROW
    ;

activity
    : COLOR_NAME? ACTIVITY_CONTENT
    ;

ifStatement
    : ifBlock
      elseIfBlock*
      elseBlock?
      ENDIF
    ;

ifBlock
   : IF condition THEN? branchLabel? (statement | ARROW)*
   ;

elseIfBlock
   : inboundBranchLabel? ELSEIF condition THEN? branchLabel? (statement | ARROW)*
   ;

elseBlock
   : inboundBranchLabel? ELSE branchLabel? (statement | ARROW)*
   ;

switchStatement
    : switchBlock
      (caseStatement)*
      ENDSWITCH
    ;

switchBlock
    : SWITCH condition
    ;

caseStatement
    : CASE condition (statement | ARROW)*
    ;

repeatStatement
    : REPEAT
      (statement | ARROW)*
      (BACKWARD activity)?
      REPEAT_WHILE condition
      (isBranch notBranch)?
    ;

isBranch
    : IS branchLabel
    ;

notBranch
    : NOT branchLabel
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

labelStatement
    : LABEL_STATEMENT
    ;

gotoStatement
    : GOTO_STATEMENT
    ;

swimlane
    : PIPE swimlaneColor? swimlaneName PIPE
    ;

swimlaneColor
    : color PIPE
    ;

color
    : COLOR | COLOR_NAME
    ;

swimlaneName
    : IDENTIFIER
    | ACTIVITY_LABEL
    ;

condition
    : LPAREN conditionContent RPAREN (comparisonOperator LPAREN conditionContent RPAREN)?
    ;

comparisonOperator
    : IS
    | EQUALS
    ;

conditionContent
    : (IDENTIFIER | ACTIVITY_LABEL | ACTIVITY_CONTENT)+
    ;

inboundBranchLabel
    : LPAREN (IDENTIFIER | ACTIVITY_LABEL) RPAREN
    ;

branchLabel
    : LPAREN (IDENTIFIER | ACTIVITY_LABEL) RPAREN
    ;

stereotypeActivity
    : activity STEREOTYPE
    ;
