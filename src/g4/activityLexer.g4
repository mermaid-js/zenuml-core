lexer grammar activityLexer;

// Diagram delimiters
STARTUML: '@startuml';
ENDUML: '@enduml';

// Keywords
START: 'start';
STOP: 'stop';
END: 'end';
LEFT: 'left';
RIGHT: 'right';
IF: 'if';
THEN: 'then';
ELSE: 'else';
ELSEIF: 'elseif';
ENDIF: 'endif';
REPEAT: 'repeat';
REPEAT_WHILE: 'repeat while';
WHILE: 'while';
ENDWHILE: 'endwhile';
SWITCH: 'switch';
CASE: 'case';
ENDSWITCH: 'endswitch';
NOT: 'not';
FORK: 'fork';
FORK_AGAIN: 'fork again';
END_FORK: 'end fork';
END_MERGE: 'end merge';
SPLIT: 'split';
SPLIT_AGAIN: 'split again';
END_SPLIT: 'end split';
DETACH: 'detach';
KILL: 'kill';
BACKWARD: 'backward';
NOTE: 'note';
END_NOTE: 'end note';
PARTITION: 'partition';
GROUP: 'group';
END_GROUP: 'end group';
PACKAGE: 'package';
RECTANGLE: 'rectangle';
CARD: 'card';

// Other tokens
FLOATING: 'floating';
IS: 'is';
AS: 'as';
OF: 'of';
ON: 'on';
EQUALS: 'equals';

// Symbols
LPAREN: '(';
RPAREN: ')';
LBRACE: '{';
RBRACE: '}';
LBRACKET: '[';
RBRACKET: ']';
PIPE: '|';

// Colors and stereotypes
COLOR: '#' [a-fA-F0-9]+;
COLOR_NAME: '#' [a-zA-Z0-9]+;
STEREOTYPE: '<<' .*? '>>';

// Simplified arrow
fragment COLON: ':';
fragment SEMICOLON: ';';
fragment ARROW_STYLE: '[' ('#' [a-zA-Z0-9]+ ','?)? ('dotted' | 'dashed' | 'bold' | 'hidden')? ']';
fragment ARROW_TEXT: ~[\r\n]* SEMICOLON?;

ARROW: '-' ARROW_STYLE? '->'
     | '-' ARROW_STYLE? '>' ARROW_TEXT;
REVERSE_ARROW: '<-';
DOUBLE_ARROW: '<->';

ACTIVITY_CONTENT: COLON .*? SEMICOLON;

fragment LABEL: 'label';
LABEL_STATEMENT: LABEL [ \t]+ IDENTIFIER;

fragment GOTO: 'goto';
GOTO_STATEMENT: GOTO [ \t]+ IDENTIFIER;

// IDENTIFIER should come before ACTIVITY_LABEL
IDENTIFIER: [a-zA-Z_] [a-zA-Z0-9_]*;

// Modified ACTIVITY_LABEL to match both single-word and multi-word labels
ACTIVITY_LABEL: [a-zA-Z0-9]+ ([a-zA-Z0-9 \t]+ [a-zA-Z0-9]+)* '?'?;

// Whitespace and comments
NEWLINE: '\r'? '\n' -> skip;
WS: [ \t\r\n]+ -> skip;
COMMENT: '\'' .*? '\r'? '\n' -> skip;

OTHER: .;
