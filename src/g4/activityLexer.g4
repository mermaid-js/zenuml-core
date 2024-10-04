lexer grammar activityLexer;

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
GOTO: 'goto';
NOTE: 'note';
END_NOTE: 'end note';
PARTITION: 'partition';
GROUP: 'group';
PACKAGE: 'package';
RECTANGLE: 'rectangle';
CARD: 'card';

// Other tokens
LABEL: 'label';
FLOATING: 'floating';
IS: 'is';
AS: 'as';

// Symbols
LPAREN: '(';
RPAREN: ')';
LBRACE: '{';
RBRACE: '}';
LBRACKET: '[';
RBRACKET: ']';
ARROW: '->';
REVERSE_ARROW: '<-';
DOUBLE_ARROW: '<->';
PIPE: '|';

COLOR: '#' [a-fA-F0-9]+;
STEREOTYPE: '<<' .*? '>>';

fragment COLON: ':';
fragment SEMICOLON: ';';

ACTIVITY_CONTENT: COLON .*? SEMICOLON;

ACTIVITY_LABEL: [a-zA-Z0-9]+ ([a-zA-Z0-9 \t]* [a-zA-Z0-9]+)? '?'?;

IDENTIFIER: [a-zA-Z_] [a-zA-Z0-9_]*;

NEWLINE: '\r'? '\n';
WS: [ \t]+ -> skip;

OTHER: .;
