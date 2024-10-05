grammar numbers;

r: INTEGER | FLOAT | SCIENTIFIC | IDENTIFIER;

// Basic building blocks
DIGIT: [0-9];
LETTER: [a-zA-Z];

// Numbers
INTEGER: DIGIT+;
FLOAT: DIGIT+ '.' DIGIT+;
SCIENTIFIC: (INTEGER | FLOAT) [eE] [+-]? INTEGER;

// Identifiers
IDENTIFIER: LETTER (LETTER | DIGIT | '_')*;

// Whitespace
WS: [ \t\r\n]+ -> skip;

// Example of a more complex token using nested definitions
COMPLEX_NUMBER: INTEGER? ('.' INTEGER)? [ij];

